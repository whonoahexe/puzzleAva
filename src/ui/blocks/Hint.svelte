<script lang='ts' context='module'>
	export enum Levels {
		INFO,
		WARN,
		ERROR,
		OK,
		NONE,
	}

	export enum LevelIcons {
		'error_outline',
		'warning',
		'error',
		'done',
	}

	export enum LevelColours {
		'--colour-text-primary',
		'--colour-warn-primary',
		'--colour-error-primary',
		'--colour-ok-primary',
	}
</script>

<script lang='ts'>
	import { writable } from 'svelte/store';
	import { CSSUtility } from '../../resources/utilities/css.utility';
	import type { CSS } from '../../resources/utilities/css.utility';

	export let level: Levels = Levels.INFO;
	export let levelWritable = writable<Levels>(level);
	// eslint-disable-next-line no-undef-init
	export let overrideColour: CSS | undefined = undefined;
</script>

<component>
	<span
		class:info={$levelWritable === Levels.INFO}
		class:warn={$levelWritable === Levels.WARN}
		class:error={$levelWritable === Levels.ERROR}
		class:ok={$levelWritable === Levels.OK}
		class:none={$levelWritable === Levels.NONE}
		class='content'
		style='
			--colour-hint: {CSSUtility.parse(overrideColour ?? LevelColours[$levelWritable] ?? '')}
		'
	>
		{#if LevelIcons[$levelWritable] != null}
			<icon>
				{LevelIcons[$levelWritable]}
			</icon>
		{/if}
		<string class='text'>
			<slot>Hint</slot>
		</string>
	</span>
</component>

<style>
	.content.none {
		opacity: 0;
		height: 0;
	}

	.content {
		display: flex;
		align-items: center;

		overflow: hidden;

		/* height for '.none' */
		opacity: 1;
		min-height: 1rem;
		padding: 0 1em;
	}

	.content * {
		color: var(--colour-hint);
	}

	.content,
	.content * {
		transition: 0.2s var(--ease-slow-slow)
	}

	string {
		font-size: 1rem;
		padding-left: 8px;
	}
</style>