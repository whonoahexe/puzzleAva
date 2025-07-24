<script lang='ts'>
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';
	import { navigate } from 'svelte-routing';

	import Button from '../blocks/Button.svelte';
	import Toast, { ToastItem } from '../blocks/Toast.svelte';
	import Matter from '../components/Matter.svelte';
	import Logo from '../blocks/Logo.svelte';

	const toastsW: Writable<ToastItem[]> = writable([]);
	const BODY_ADDER_EASTER_EGG = {
		20: 'ava, i feel like you\'d like cookie clicker',
		50: 'to make myself clear, i do not have cookies',
		69: 'hehe nice, 69th click',
		100: 'if you are this persistent in fictional men, maybe they should come alive?',
		200: 'okay at this point you\'re probably digging for the treasure, that i may or may not have...',
		300: 'i could give you a coupon code or something if you keep clicking, it\'s only your fingers that you\'re sacrificing!',
		400: 'what the hell why are you still going, i didn\'t even know my shitty code could handle so many!',
		500: 'ava, stop, seriously, i\'ve run out of quirky lines!',
		1000: 'get out.',
		6969: 'hey you! yeah you, the one that\'s looking through my code! you\'re lucky i couldn\'t be arsed to obfuscate my easter eggs... or could i?',
	};
	const FICTIONAL_MEN = {
		1: 'https://www.instagram.com/freddycarter1/?hl=en',
		2: 'https://www.instagram.com/somb.r/?hl=en',
		3: 'https://www.instagram.com/jamesmcavoyrealdeal/?hl=en',
		4: 'https://www.instagram.com/scamanderbrothers/?hl=en',
		5: 'https://www.instagram.com/_conradfisher_/?hl=en',
		6: 'https://disney.fandom.com/wiki/Beast',
		7: 'https://disney.fandom.com/wiki/Flynn_Rider',
		8: 'https://disney.fandom.com/wiki/Prince_Naveen',
		9: 'https://the-folk-of-the-air.fandom.com/wiki/Cardan_Greenbriar',
		10: 'https://www.instagram.com/calahan.skogman/?hl=en',
		11: 'https://www.instagram.com/johnnyorlando/?hl=en',
		12: 'https://www.youtube.com/watch?v=eFS5vxYlfY8',
		13: 'https://www.instagram.com/hugh_dancy/?hl=en',
		14: 'https://www.instagram.com/twhiddleston/?hl=en',
		15: 'https://www.instagram.com/damianhardung/?hl=en',
		16: 'https://a-good-girls-guide-to-murder.fandom.com/wiki/Ravi_Singh',
		17: 'https://shatterme.fandom.com/wiki/Aaron_Warner',
		18: 'https://thegrishaverse.fandom.com/wiki/Matthias_Helvar',
		19: 'https://www.instagram.com/louispartridge_/?hl=en',
		20: 'https://www.instagram.com/lorenzo_zurzolo/?hl=en',
		21: 'https://www.instagram.com/cillianmurphyofficiall/?hl=en',
		22: 'https://open.spotify.com/artist/3nnQpaTvKb5jCQabZefACI'
	}

	let button: Button;
	let matter: Matter;

	export let isButtonActive = true;
	export let buttonIcon = 'done';
	export let buttonText = 'find my man';
	export let toastText = 'fine, you keep your men, i\'ll keep my cookies...';
	export let buttonURL = 'https://www.instagram.com/noah_exe.spm/';
	export let heading = '';
	export let string = '';

	let bodiesAdded = 0;
</script>


<component>
	{#if button}
		<Matter
			bind:this={matter}
			{button}
		/>
	{/if}
	{#if isButtonActive}
		<Button
			bind:this={button}
			icon={buttonIcon}
			on:click={() => {
				$toastsW.push(ToastItem.from({
					text: toastText,
				}));

				$toastsW = $toastsW;

				// Get random fictional man URL
				const menKeys = Object.keys(FICTIONAL_MEN);
				const randomKey = menKeys[Math.floor(Math.random() * menKeys.length)];
				// @ts-expect-error
				const randomManURL = FICTIONAL_MEN[randomKey];

				navigate(randomManURL);
			}}
		>
			{buttonText}
		</Button>
	{/if}
	<Toast
		{toastsW}
	/>
	<container
		class='all'
	>
		<container
			class='logo'
		>
			<Logo
				on:click={() => {
					matter.addNewBody();

					++bodiesAdded;

					// @ts-expect-error
					if (BODY_ADDER_EASTER_EGG[bodiesAdded] != null) {
						// @ts-expect-error
						// eslint-disable-next-line no-alert
						alert(BODY_ADDER_EASTER_EGG[bodiesAdded]);
					}
				}}
			/>
		</container>
		<container
			class='text'
		>
			<heading>
				{heading}
			</heading>
			<string>
				{string}
			</string>
		</container>
	</container>
</component>

<style>
	component {
		height: 100%;
		width: 100vw;

		position: absolute;

		overflow: hidden;
		overflow: clip;

		z-index: 0;
	}

	container.all {
		position: absolute;
		top: 0;
		left: 0;

		padding: var(--padding);
		box-sizing: border-box;

		height: 100%;
		width: 100vw;

		pointer-events: none;

		display: grid;
    	grid-template-rows: min-content auto;
	}

	container.logo {
		width: min-content;
		pointer-events: all;
	}

	container.text {
		display: flex;
		justify-content: flex-end;
		flex-direction: column;
	}

	container.text > * {
		white-space: pre-line;

		text-shadow: 6.66667px 6.66667px 20px rgb(0 0 0 / 10%);
	}

	container.text > heading {
		font-size: 10rem;
		letter-spacing: -0.12em;
    	line-height: 0.6em;

		padding-bottom: 0.1em;

		word-break: break-word;

		color: var(--colour-accent-primary);
	}

	container.text > string {
		/* pointer-events: all; */

		padding-left: 0.6rem;
		padding-bottom: 0.1rem;

		mix-blend-mode: difference;
	}
</style>