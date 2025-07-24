<script lang='ts'>
	import {
		onMount,
		createEventDispatcher,
	} from 'svelte';
	import Button from '../Button.svelte';
	import { CSSUtility } from '../../../resources/utilities/css.utility';

	export let hoverColour = '#0000';
	export let backgroundColour = '#0000';
	export let height = '100%';
	export let width = '100%';

	export let svgSrc = '';
	export let svg = '';
	export let svgColour = backgroundColour;

	const dispatch = createEventDispatcher();

	let svgPlaceholderDomContent: HTMLDivElement;

	onMount(async () => {
		if ($$slots.default) {
			return;
		}

		const svgText = (
			svg
			|| (
				svgSrc
				&& await (await fetch(svgSrc)).text()
			)
			|| ''
		);

		svgPlaceholderDomContent.outerHTML = svgText;
	});
</script>

<component
	style='
		--height: {CSSUtility.parse(height)};
		--width: {CSSUtility.parse(width)};
	'
>
	<Button
		{...$$restProps}
		{height}
		{width}
		{backgroundColour}
		{hoverColour}
		isText={false}
		padding='16px 16px'
		roundness='50px'
		on:click={() => {
			dispatch('click');
		}}
	>
		<container
			style='
				--svg-colour: {svgColour};
			'
		>
			<slot>
				<placeholder
					bind:this={svgPlaceholderDomContent}
				/>
			</slot>
		</container>
	</Button>
</component>

<style>
	container {
		height: 100%;
		width: var(--width);

		fill: var(--svg-colour);

		overflow: hidden;
	}
</style>