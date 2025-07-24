import * as easings from 'svelte/easing';
import { Ctx } from './ctx';
import { TransitionerResultItem } from './_transitioner/item';

type EasingType = typeof easings[keyof typeof easings];

type TransitionOptions = {
	delay?: number;
	duration?: number;
	easing?: EasingType;
};

export * from './_transitioner/item';

export class Transitioner {
	private isInRegistered = false;
	private isOutRegistered = false;
	private inIndex = 0;
	private outIndex = 0;
	private inLength = 0;
	private outLength = 0;

	// use arrow functions to keep 'this' bound
	// even if destructured
	public t = (): Partial<TransitionerResultItem> => {
		let index = this.inIndex % this.inLength;

		if (!this.isInRegistered) {
			index = this.inLength++;

			setTimeout(() => {
				this.isInRegistered = true;
			}, 0);
		}

		++this.inIndex;

		return {
			delay: index * 50,
		};
	};

	public tt = (): Partial<TransitionerResultItem> => {
		let index = this.outIndex % this.outLength;

		if (!this.isOutRegistered) {
			index = this.outLength++;

			setTimeout(() => {
				this.isOutRegistered = true;
			}, 0);
		}

		++this.outIndex;

		return {
			delay: index * 50,
		};
	};

	public static noop(): TransitionerResultItem {
		return TransitionerResultItem.from({
			delay: 0,
			duration: 0,
			easing: (t) => t,
			css: () => '',
		});
	}

	public static fade(
		element: Element,
		{
			delay = 0,
			duration = 200,
			easing = easings.quintInOut,
		}: TransitionOptions,
		tick?: TransitionerResultItem['tick'],
	): TransitionerResultItem {
		const {
			opacity,
		} = getComputedStyle(element);

		return TransitionerResultItem.from({
			delay,
			duration,
			easing,
			css: (t) => `opacity: ${t * Number(opacity)}`,
			tick,
		});
	}

	public static fadeIn(
		element: Element,
		options: TransitionOptions,
	): TransitionerResultItem {
		Ctx.isInAnimationRunning = true;

		return Transitioner.fade(
			element,
			{
				easing: easings.quintOut,
				...options,
			},
			Transitioner.onInTick,
		);
	}

	public static fadeOut(
		element: Element,
		options: TransitionOptions,
	): TransitionerResultItem {
		Ctx.isInAnimationRunning = true;

		return Transitioner.fade(
			element,
			{
				easing: easings.quintIn,
				...options,
			},
			Transitioner.onOutTick,
		);
	}

	public static dropIn(
		element: Element,
		{
			delay = 0,
			duration = 500,
			easing = easings.expoOut,
		}: TransitionOptions,
	): TransitionerResultItem {
		const computed = getComputedStyle(element);
		const opacity = Number(computed.opacity);
		const transform = computed.transform === 'none'
			? ''
			: computed.transform;

		Ctx.isInAnimationRunning = true;

		return TransitionerResultItem.from({
			delay,
			duration,
			easing,
			css: (t, u) => `
				transform: ${transform} translateY(${u * -20}px);
				opacity: ${opacity * Math.min(t * 2, 1)};
			`,
			tick: Transitioner.onInTick,
		});
	}

	public static dropOut(
		element: Element,
		{
			delay = 0,
			duration = 200,
			easing = easings.expoIn,
		}: TransitionOptions,
	): TransitionerResultItem {
		const computed = getComputedStyle(element);
		const opacity = Number(computed.opacity);
		const transform = computed.transform === 'none'
			? ''
			: computed.transform;

		Ctx.isOutAnimationRunning = true;

		return TransitionerResultItem.from({
			delay,
			duration,
			easing,
			css: (t, u) => `
				transform: ${transform} translateY(${u * -20}px);
				opacity: ${opacity * t};
			`,
			tick: Transitioner.onOutTick,
		});
	}

	private static onInTick(t: number) {
		if (t !== 1) {
			return;
		}

		Ctx.isInAnimationRunning = false;
	}

	private static onOutTick(t: number) {
		if (t !== 0) {
			return;
		}

		Ctx.isOutAnimationRunning = false;
	}
}

export const {
	fade,
	fadeIn,
	fadeOut,
	dropIn,
	dropOut,
	noop,
} = Transitioner;

export { easings };
