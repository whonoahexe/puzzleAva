<script lang='ts'>
	import { createEventDispatcher } from 'svelte';
	import { navigate } from 'svelte-routing';
	import SvgButton from './buttons/SvgButton.svelte';
	import { CSSUtility } from '../../resources/utilities/css.utility';

	export let colour = '--colour-accent-primary';

	const dispatch = createEventDispatcher();
</script>

<component>
	<SvgButton
		height='56px'
		width='56px'
		on:click={() => {
			dispatch('click');

			if (window.location.pathname !== '/') {
				navigate('/');
			}

			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth',
			});
		}}
		svg='ava!'
	>
	</SvgButton>
</component>

<style>
	component {
		height: 50px;
		width: 50px;
	}
</style>