<script lang='ts' context='module'>
	/* eslint-disable @typescript-eslint/no-duplicate-imports */
	import { Item } from '../../core/blocks/item';
	import { Levels } from './Hint.svelte';

	export class ToastItem extends Item {
		// uid: string;
		// constructor() {
		// 	super();
	
		// 	this.uid = String(Date.now());
		// 	this.text = '';
		// 	this.level = Levels.INFO;
		// 	this.duration = 2000;
		// }
		uid = String(Date.now());
		text = '';
		level: Levels = Levels.INFO;
		duration = 2000;
	}

	export { Levels };
</script>

<script lang='ts'>
	import { writable } from 'svelte/store';
	import { CSSUtility } from '../../resources/utilities/css.utility';
	import Hint, { LevelColours } from './Hint.svelte';
	import {
		dropIn,
		dropOut,
	} from '../../core/transitioner';
	import Button from './Button.svelte';

	export let toasts: ToastItem[] = [];
	export let toastsW = writable(toasts);

	const scheduledUIDs: string[] = [];

	if ($toastsW == null) {
		$toastsW = [];
	}

	$: (
		$toastsW.forEach((toast) => {
			scheduleDismiss(toast.uid, toast.duration);
		})
	);

	function dismiss(uid: string) {
		$toastsW
			.splice(
				$toastsW
					.findIndex((toast) => toast.uid === uid),
				1,
			);
		$toastsW = $toastsW;
	}

	function scheduleDismiss(uid: string, duration: number) {
		if (scheduledUIDs.includes(uid)) {
			return;
		}

		setTimeout(() => {
			dismiss(uid);
		}, duration);

		scheduledUIDs.push(uid);
	}
</script>

<component>
	{#each $toastsW as toast}
		<container
			style='
				--colour-toast: {CSSUtility.parse(LevelColours[toast.level])}
			'
			in:dropIn
			out:dropOut
		>
			<Hint
				level={toast.level}
				overrideColour='--colour-background-primary'
			>
				{toast.text}
			</Hint>
			<Button 
				icon='clear'
				backgroundColour='transparent'
				textColour='--colour-background-primary'
				hoverColour='#fff2'
				padding='4px 8px'
				height={32}
				on:click={() => {
 dismiss(toast.uid);
}}
			/>
		</container>
	{/each}
</component>

<style>
	component {
		position: fixed;

		right: 0;
		bottom: 0;

		margin: var(--padding);

		z-index: 1000;
	}

	container {
		background: var(--colour-toast);

		padding: 4px 24px 4px 32px;

		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;

		border-radius: var(--roundness);

		width: max-content;
		/* max-width: 25vw; */

		margin-top: var(--padding);
	}
</style>