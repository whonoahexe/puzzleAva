<script lang='ts'>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { expoOut } from 'svelte/easing';
	import { CSSUtility } from '../../resources/utilities/css.utility';
	import type { CSS } from '../../resources/utilities/css.utility';

	export let x: number;
	export let y: number;
	export let sizeIn: number;
	export let size: number;
	export let speed: number;
	export let opacityIn: number;
	export let fill: CSS;

	const rippleSize = tweened(sizeIn, { duration: speed });
	const rippleOpacity = tweened(opacityIn, {
		duration: speed + (speed * 2.5),
		easing: expoOut,
	});

	onMount(() => {
		void rippleSize.set(size);
		void rippleOpacity.set(0);
	});
</script>

<circle style='fill: {CSSUtility.parse(fill)};' cx="{x}" cy="{y}" r={$rippleSize} opacity={$rippleOpacity}/>