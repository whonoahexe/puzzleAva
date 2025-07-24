<script lang='ts'>
	import Matter from 'matter-js';
	import { onDestroy, onMount } from 'svelte';
	import { CSSUtility } from '../../resources/utilities/css.utility';
	import { WindowUtility } from '../../resources/utilities/window.utility';
	import type Button from '../blocks/Button.svelte';

	const {
		Body,
		Bodies,
		Composites,
		Common,
		Engine,
		Events,
		Mouse,
		MouseConstraint,
		Query,
		Render,
		Runner,
		Vector,
		World,
	} = Matter;

	// eslint-disable-next-line no-undef-init
	export let button: Button | undefined = undefined;

	let canvas: HTMLCanvasElement;
	let height = 0;
	let width = 0;
	let wallBodies: Record<'top' | 'right' | 'bottom' | 'left', Matter.Body> = {} as any;
	let render: Matter.Render;
	let world: Matter.World;
	let mouse: Matter.Mouse;
	let mouseConstraint: Matter.MouseConstraint;
	let buttonBody: Matter.Body;
	let buttonDomContent: HTMLDivElement;
	let buttonComputedStyles: CSSStyleDeclaration;

	const WALL_THICKNESS = 100;
	const BODIES_SCALE = 1.5;
	const BODY_COLOURS = [
		CSSUtility.getVariable('--colour-text-primary'),
		CSSUtility.getVariable('--colour-background-primary'),
		CSSUtility.getVariable('--colour-text-secondary'),
		CSSUtility.getVariable('--colour-background-secondary'),
	];

	export const addNewBody = () => {
		World.addBody(world, getRandomBody(width / 2, WALL_THICKNESS / 2));
	};

	onMount(() => {
		document.documentElement.addEventListener('mouseout', onMouseOut);
		// apply sizes to canvas & other things
		onResize();

		// create engine
		const engine = Engine.create();
		world = engine.world;

		// set renderer
		render = Render.create({
			canvas,
			engine,
			options: {
				width,
				height,
				// showAngleIndicator: true
				background: 'transparent', // transparent to hide
				wireframeBackground: 'transparent', // transparent to hide
				wireframes: false,
			},
		});

		Render.run(render);

		// create runner
		const runner = Runner.create();
		Runner.run(runner, engine);

		// add bodies
		const stack = Composites.stack(
			WALL_THICKNESS, // xx
			height / 3, // yy
			20, // columns
			4, // rows
			0, // column gap
			0, // rows gap
			getRandomBody,
		);

		const transparentRender = {
			fillStyle: 'transparent',
			strokeStyle: 'transparent',
		};

		wallBodies = {
			top: Bodies.rectangle(0, 0, 100, 100, { isStatic: true, render: transparentRender }),
			right: Bodies.rectangle(0, 0, 100, 100,	{ isStatic: true, render: transparentRender }),
			bottom: Bodies.rectangle(0, 0, 100, 100, { isStatic: true, render: transparentRender }),
			left: Bodies.rectangle(0, 0, 100, 100, { isStatic: true, render: transparentRender }),
		};

		applyWallPositions(wallBodies);

		World.add(
			world,
			[
				stack,
				...Object.values(wallBodies),
			],
		);

		// add gyro control
		window.addEventListener('deviceorientation', (event) => {
			if (event.gamma == null
				|| event.beta == null) {
				return;
			}
	
			const orientation = window.orientation == null
				? 0
				: window.orientation;
			const { gravity } = engine.world;

			if (orientation === 0) {
				gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
				gravity.y = Common.clamp(event.beta, -90, 90) / 90;
			} else if (orientation === 180) {
				gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
				gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
			} else if (orientation === 90) {
				gravity.x = Common.clamp(event.beta, -90, 90) / 90;
				gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
			} else if (orientation === -90) {
				gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
				gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
			}
		});

		// add mouse control
		mouse = Mouse.create(render.canvas);
		mouseConstraint = MouseConstraint.create(engine, {
			mouse,
			constraint: {
				stiffness: 0.2,
				render: {
					visible: false,
				},
			},
		});

		World.add(world, mouseConstraint);

		// keep the mouse in sync with rendering
		(render as any).mouse = mouse;

		// stub all these things to prevent matter from scaling shit wonkily
		(Render as any).startViewTransform = () => {};
		(Mouse as any).setScale = () => {};
		(Mouse as any).setOffset = () => {};

		// fit the render viewport to the scene
		applyRenderBounds(render, height, width);

		// limit velocity
		let dragBody: Matter.Body;
		let counter = 0;

		Matter.Events.on(engine, 'beforeUpdate', () => {
			counter += 0.014;
			if (counter < 0) {
				return;
			}

			if (dragBody != null) {
				if (dragBody.velocity.x > 25.0) {
					Matter.Body.setVelocity(dragBody, { x: 25, y: dragBody.velocity.y });
				}

				if (dragBody.velocity.y > 25.0) {
					Matter.Body.setVelocity(dragBody, { x: dragBody.velocity.x, y: 25 });
				}
			}
		});

		Matter.Events.on(mouseConstraint, 'startdrag', (event) => {
			dragBody = event.body;
		});

		// setup button tracking & moving
		if (button != null) {
			buttonDomContent = button.getComponentDomContent();
			buttonComputedStyles = getComputedStyle(buttonDomContent);
			const buttonWidth = CSSUtility.unparse(buttonComputedStyles.width);
			const buttonHeight = CSSUtility.unparse(buttonComputedStyles.height);
			buttonBody = Bodies.rectangle(
				(width) / 2,
				WALL_THICKNESS,
				buttonWidth,
				buttonHeight,
				{
					chamfer: {
						radius: Math.min(buttonWidth, buttonHeight) / 2,
					},
					render: transparentRender,
					mass: 50,
				},
			);

			buttonDomContent.style.position = 'fixed';
			buttonDomContent.style.top = '0px';
			buttonDomContent.style.zIndex = '-1';

			let consecutiveFramesOutOfBound = 0;

			// start moving the button to its correct spot
			requestAnimationFrame(function raf() {
				if (Math.floor(buttonBody.position.x) < -(buttonDomContent.offsetHeight / 2)
					|| Math.floor(buttonBody.position.y) <= -(buttonDomContent.offsetHeight / 2)
					|| Math.floor(buttonBody.position.x) >= WindowUtility.inner.width + (buttonDomContent.offsetHeight / 2)
					|| Math.floor(buttonBody.position.y) >= WindowUtility.inner.height + (buttonDomContent.offsetHeight / 2)) {
					++consecutiveFramesOutOfBound;
				} else {
					consecutiveFramesOutOfBound = 0;
				}

				if (consecutiveFramesOutOfBound > 10) {
					// stop mouse hold
					mouse.button = -1;

					// eslint-disable-next-line no-alert
					alert('you had one job.');

					Body.setPosition(buttonBody, Vector.create(width / 2, height / 2));

					consecutiveFramesOutOfBound = 0;
				}
	
				applyButtonTransformationsFromBody(buttonDomContent, buttonBody);
				requestAnimationFrame(raf);
			});

			let isHoveringOverButton = false;

			Events.on(mouseConstraint, 'mousemove', (event) => {
				const mouseX = event.source.mouse.absolute.x;
				const mouseY = event.source.mouse.absolute.y;

				isHoveringOverButton = Query.point([buttonBody], { x: mouseX, y: mouseY }).length !== 0;

				if (!isHoveringOverButton) {
					document.body.style.cursor = 'unset';
					buttonDomContent
						.querySelector('button')!
						.classList.remove('hover');

					return;
				}
	
				document.body.style.cursor = 'pointer';
				buttonDomContent
					.querySelector('button')!
					.classList.add('hover');
			});

			// add events to check if it's a click or a drag
			// by comparing mousedown mouse positions & mouseup mouse positions
			let mouseDownX = 0;
			let mouseDownY = 0;
			let mouseUpX = 0;
			let mouseUpY = 0;

			Events.on(mouseConstraint, 'mousedown', (event) => {
				mouseDownX = event.source.mouse.absolute.x;
				mouseDownY = event.source.mouse.absolute.y;
			});

			Events.on(mouseConstraint, 'mouseup', (event) => {
				mouseUpX = event.source.mouse.absolute.x;
				mouseUpY = event.source.mouse.absolute.y;
				if (isHoveringOverButton
				&& Math.abs(mouseDownX - mouseUpX) < 2
				&& Math.abs(mouseDownY - mouseUpY) < 2) {
					button?.onClick();
				}
			});

			World.addBody(world, buttonBody);
		}
	});

	onDestroy(() => {
		document.documentElement.removeEventListener('mouseout', onMouseOut);
	});

	function onMouseOut(event: MouseEvent) {
		if (event.clientX - document.documentElement.clientWidth > 5
			|| event.clientY - document.documentElement.clientHeight > 5) {
			return;
		}
	
		if (!(event.target instanceof HTMLCanvasElement)) {
			return;
		}

		(mouse as any).mouseup(event);
	}

	function getRandomBody(x: number, y: number) {
		const {
			Common,
			Bodies,
		} = Matter;

		let sides = Math.round(Common.random(1, 8));

		// triangles can be a little unstable, so avoid until fixed
		sides = (sides === 3) ? 4 : sides;

		// round the edges of some bodies
		const chamfer: Matter.IChamfer = {
			radius: 10,
		};

		const render: Matter.IBodyRenderOptions = {
			fillStyle: BODY_COLOURS[Math.floor(Math.random() * BODY_COLOURS.length)],
			// strokeStyle: CSSUtility.getVariable('--colour-text-primary'),
			// lineWidth: 5,
		};

		const mass = 2;

		switch (Math.round(Common.random(0, 1))) {
			case 0: {
				if (Common.random() < 0.8) {
					return Bodies.rectangle(
						x,
						y,
						Common.random(25, 50) * BODIES_SCALE,
						Common.random(25, 50) * BODIES_SCALE,
						{
							chamfer,
							render,
							mass,
						});
				}

				return Bodies.rectangle(
					x,
					y,
					Common.random(25, 30) * BODIES_SCALE,
					Common.random(25, 30) * BODIES_SCALE,
					{
						chamfer,
						render,
						mass,
					},
				);
			}

			case 1:
			default: {
				return Bodies.polygon(
					x,
					y,
					sides,
					Common.random(25, 50) * BODIES_SCALE,
					{
						chamfer,
						render,
					});
			}
		}
	}

	function applyButtonTransformationsFromBody(buttonDomContent: HTMLDivElement, body: Matter.Body) {
		buttonDomContent.style.transform = `translate(${
			body.position.x - (buttonDomContent.offsetWidth / 2)
		}px, ${
			body.position.y - (buttonDomContent.offsetHeight / 2)
		}px) rotate(${
			body.angle
		}rad)`;
	}

	function onResize() {
		height = WindowUtility.client.height;
		width = WindowUtility.client.width;

		canvas.height = height;
		canvas.width = width;

		if (wallBodies.top != null
			&& wallBodies.right != null
			&& wallBodies.bottom != null
			&& wallBodies.left != null) {
			applyWallPositions(wallBodies);
		}

		if (render != null) {
			applyRenderBounds(render, height, width);
		}
	}

	function applyWallPositions(walls: Record<'top' | 'right' | 'bottom' | 'left', Matter.Body>) {
		Body.scale(walls.top, width / walls.top.bounds.max.x, 1);
		Body.setPosition(walls.top, Vector.create(width / 2, WALL_THICKNESS / 2));

		Body.scale(walls.right, 1, height / walls.right.bounds.max.y);
		Body.setPosition(walls.right, Vector.create(width - (WALL_THICKNESS / 2), height / 2));

		Body.scale(walls.bottom, width / walls.bottom.bounds.max.x, 1);
		Body.setPosition(walls.bottom, Vector.create(width / 2, height - (WALL_THICKNESS / 2)));

		Body.scale(walls.left, 1, height / walls.left.bounds.max.y);
		Body.setPosition(walls.left, Vector.create(WALL_THICKNESS / 2, height / 2));
	}

	function applyRenderBounds(render: Matter.Render, height: number, width: number) {
		Render.lookAt(render, {
			min: { x: 0, y: 0 },
			max: { x: width, y: height },
		});
	}
</script>

<svelte:window 
	on:resize={onResize}
/>

<canvas
	bind:this={canvas}
/>