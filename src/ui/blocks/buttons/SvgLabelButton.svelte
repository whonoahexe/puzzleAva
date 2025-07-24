<script lang='ts'>
	import {
		onMount,
		createEventDispatcher,
	} from 'svelte';
	import Button from './Button.svelte';
	import { CSSUtility } from '../../../resources/utilities/css.utility';

	export let backgroundColour = '--colour-accent-primary';
	export let height = '100%';
	export let width = '100%';

	export let svgSrc = '';
	export let svg = '';
	export let svgColour = backgroundColour;
	
	const dispatch = createEventDispatcher();

	let svgPlaceholderDomContent: HTMLDivElement;

	onMount(async () => {
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
	<container 
		style='
			--svg-colour: {svgColour};
		'
	>
		<placeholder
			bind:this={svgPlaceholderDomContent}
		/>
	</container>
	<Button
		{backgroundColour}
		{height}
		{width}
		{...$$restProps}
		on:click={() => {
 dispatch('click');
}}
	>
		<slot></slot>
	</Button>
</component>

<style>
	component {
		height: var(--height);

		display: flex;
		flex-direction: row;
	}

	container {
		height: var(--height);
		width: var(--height);

		padding: 16px;
		box-sizing: border-box;

		align-self: center;
		justify-self: center;

		fill: var(--svg-colour);

		flex-shrink: 0;

		background: var(--colour-background-secondary);
	}
</style>
