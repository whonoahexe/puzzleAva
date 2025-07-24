import { quintInOut } from 'svelte/easing';
import { Item } from '../blocks/item';

export type TransitionCSSString = string;

export class TransitionerResultItem extends Item {
	delay = 0;
	duration = 200;
	easing = quintInOut;
	css: (time: number, invertedTime: number) => TransitionCSSString = (() => {}) as any;
	tick: ((time: number, invertedTime: number) => void) | undefined = undefined;
}
