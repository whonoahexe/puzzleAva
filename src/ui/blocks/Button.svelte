<script lang='ts'>
	import {
		onMount,
		createEventDispatcher,
	} from 'svelte';
	import { writable } from 'svelte/store';
	import { Shadow } from '../../core/shadow';
	import Ripple from './Ripple.svelte';
	import { CSSUtility } from '../../resources/utilities/css.utility';
	import type { CSS } from '../../resources/utilities/css.utility';

	export let backgroundColour: CSS = '--colour-accent-primary';
	export let hoverColour: CSS = '--colour-accent-secondary';
	export let rippleColour: CSS = 'white';
	export let textColour: CSS = '--colour-text-primary';
	export let icon: CSS = 'done';
	export let iconSize: CSS = '1rem';
	export let width: CSS = 'max-content';
	export let roundness: CSS = '--roundness';
	export let height: CSS = 'max(calc(var(--border-radius) * 2), 56px)';
	export let depth = 1;
	export let isText = true;
	export let textAlign: CSS = 'center';
	export let padding: CSS = '16px max(var(--border-radius), 24px)';
	export let isFocusedW = writable(false);
	export let isDisabled = false;
	export let isDisabledW = writable(isDisabled);
	export let isAnimated = true;
	export let isAnimatedW = writable(isAnimated);
	export let transition = '0.2s var(--ease-slow-slow)';
	export let transitionW = writable(transition);
	export let isTextInvertedAgainstBackground = false;
	export let isTextInvertedAgainstBackgroundW = writable(isTextInvertedAgainstBackground);
	export let isHovered = false;
	export let isHoveredW = writable(isHovered);
	export const getComponentDomContent = () => componentDomContent;
	export const getButtonDomContent = () => buttonDomContent;

	const speed = 1000;
	const sizeIn = 20;
	const opacityIn = 0.2;
	const dispatch = createEventDispatcher();

	const ripples = (() => {
		const arrayW = writable<any[]>([]);

		return {
			...arrayW,
			add: (item: any) => {
				arrayW.update((items) => [...items, item]);
			},
			clear: () => {
				arrayW.update(() => []);
			},
		};
	})();

	let componentDomContent: HTMLDivElement;
	let buttonDomContent!: HTMLButtonElement;
	const button: {
		width: number;
		height: number;
		x: number;
		y: number;
	} = {
		get width() {
			return Number(Boolean(buttonDomContent)) && buttonDomContent.offsetWidth;
		},
		get height() {
			return Number(Boolean(buttonDomContent)) && buttonDomContent.offsetHeight;
		},
		get x() {
			return Number(Boolean(buttonDomContent)) && buttonDomContent.getBoundingClientRect().x;
		},
		get y() {
			return Number(Boolean(buttonDomContent)) && buttonDomContent.getBoundingClientRect().y;
		},
	};

	onMount(() => {
		Shadow.apply(-depth, buttonDomContent);
		Shadow.apply(depth, componentDomContent);
	});

	const coords = {
		x: 50,
		y: 50,
	};

	$: offsetX = Math.abs((button.width / 2) - coords.x);
	$: offsetY = Math.abs((button.height / 2) - coords.y);
	$: deltaX = (button.width / 2) + offsetX;
	$: deltaY = (button.height / 2) + offsetY;
	$: scaleRatio = Math.sqrt((deltaX ** 3) + (deltaY ** 3));
	
	let isTouched = false;
	let timeoutHandle: ReturnType<typeof setTimeout>;

	export function onMouseDown(event: MouseEvent | TouchEvent, type: string) {
		switch (type) {
			case 'touch': {
				isTouched = true;
				ripples.add({
					x: (event as TouchEvent).touches[0].pageX - button.x,
					y: (event as TouchEvent).touches[0].pageY - button.y,
					size: scaleRatio,
				});
	
				break;
			}

			case 'click': {
				if (isTouched) {
					isTouched = false;

					break;
				}

				ripples.add({
					x: (event as MouseEvent).clientX - button.x,
					y: (event as MouseEvent).clientY - button.y,
					size: scaleRatio,
				});

				break;
			}

			default:
		}

		clearTimeout(timeoutHandle);
		timeoutHandle = setTimeout(() => {
			ripples.clear();
		}, speed + (speed * 2));

		if (!event.currentTarget) {
			return;
		}

		(event
			.currentTarget as HTMLElement)
			?.parentElement
			?.classList
			.remove('unpressed');
	}

	export function onMouseUp(event: MouseEvent | TouchEvent) {
		if (!event.currentTarget) {
			return;
		}

		(event
			.currentTarget as HTMLElement)
			?.parentElement
			?.classList
			.remove('unpressed');
	}

	export function onMouseOver() {
		isHoveredW.set(true);
	}

	export function onMouseOut() {
		isHoveredW.set(false);
	}

	export function onClick() {
		dispatch('click');
	}
</script>

<component
	class:unpressed={!$isFocusedW}
	bind:this={componentDomContent}
	style='
		--width: {CSSUtility.parse(width)};
		--height: {CSSUtility.parse(height)};
		--border-radius: {CSSUtility.parse(roundness)};
	'
>
	<container
		class='background'
	>
		<slot name='background' />
	</container>
	<button
		bind:this={buttonDomContent}
		class:hover={$isHoveredW}
		style='
			--colour-background: {CSSUtility.parse(backgroundColour)};
			--colour-hover: {CSSUtility.parse($isAnimatedW ? hoverColour : backgroundColour)};
			--colour-ripple: {CSSUtility.parse(rippleColour)};
			--colour-text: {CSSUtility.parse($isTextInvertedAgainstBackgroundW ? 'white' : textColour)};
			--button-padding: {CSSUtility.parse(padding)};
			--icon-size: {CSSUtility.parse(iconSize)};
			--text-align: {textAlign};
			--transition: {$isAnimatedW ? $transitionW : 'unset'};
			--mix-blend-mode: {$isTextInvertedAgainstBackgroundW ? 'difference' : 'unset'};
		'
		on:click={() => {
			onClick();
		}}
		on:focus={() => {
			isFocusedW.set(true);
		}}
		on:blur={() => {
			isFocusedW.set(false);
		}}
		on:touchstart|passive={(event) => {
			onMouseDown(event, 'touch');
		}}  
		on:mousedown={(event) => {
			onMouseDown(event, 'click');
		}}
		on:touchend|passive={(event) => {
			onMouseUp(event);
		}}
		on:mouseup={(event) => {
			onMouseUp(event);
		}}
		on:mouseover={() => {
			onMouseOver();
		}}
		on:mouseout={() => {
			onMouseOut();
		}}
		disabled={$isDisabledW}
	>
		<span class='content'>
			{#if isText}
				<icon>
					<slot name='icon'>
						{icon ?? ''}
					</slot>
				</icon>
				<string>
					<slot></slot>
				</string>
			{:else}
				<slot></slot>
			{/if}
		</span>	
		<svg>
			{#each $ripples as ripple}
				<Ripple 
					x='{ripple.x}' 
					y='{ripple.y}' 
					size={ripple.size} 
					{speed} 
					{sizeIn} 
					{opacityIn} 
					fill={rippleColour}
				/>
			{/each}
		</svg>
	</button>
</component>

<style>
	component {
		height: var(--height);
		width: var(--width);

		box-shadow: var(--shadow);

		transform: translateX(0px);

		border-radius: var(--border-radius);

		/* transition: 0.2s var(--ease-slow-slow); */
	}

	component.unpressed {
		box-shadow: var(--shadow-inactive);
	}

	/* component:hover {
		width: calc(var(--width) + 28px);
	} */

	button {
		/* for stupid cunts that don't support 'max()'' */
		height: 56px;
		height: var(--height);
		width: var(--width);

		background: var(--colour-background);

		transform: matrix(1, 0, 0, 1, 0, 0);
		padding: var(--button-padding);

		border: 0;
		outline: none;
		-webkit-tap-highlight-color: transparent;

		cursor: pointer;

		border-radius: var(--border-radius);

		box-shadow: var(--shadow-inactive);

		transition: var(--transition);
	}
	
	button.hover, button:hover {
		background: var(--colour-hover);
	}

	button:active {
		box-shadow: var(--shadow);
	}

	button * {
		color: var(--colour-text);
		mix-blend-mode: var(--mix-blend-mode);
	}

	.content {
		position: relative;
		height: 100%;
		width: 100%;

		display: flex;
		align-items: center;
		justify-content: var(--text-align);

		margin: 0;
		padding: 0;
		/* z-index: 0; */
	}

	string {
		font-size: 1rem;
		font-variation-settings: var(--font-variation-regular);

		margin: 0;
		user-select: none;
	}

	string:not(:empty) {
		padding-left: 8px;
	}

	icon:empty ~ string {
		padding-left: 0;
	}

	svg {
		height: 100%;
		width: 100%;

		border-radius: var(--border-radius);

		pointer-events: none;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;
	}

	icon {
		font-size: var(--icon-size);
		line-height: var(--icon-size);
	}

	container.background {
		height: 100%;
		width: 100%;

		position: absolute;
	}
</style>

<svelte:options accessors />