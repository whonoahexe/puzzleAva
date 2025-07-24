import StackTrace from 'stacktrace-js';
import { UnexpectedValueError } from '../resources/errors/unexpectedValue.error';
import { Store } from './store';

const _: any = undefined;

// any types are because the type defs are in svelte files
// which ts kinda doesn't wanna touch properly
export class Contexts {
	static '*' = _;
	static globalAppBar: any = _;
	static globalHamburger: Record<string, () => void> | undefined = _;
	static globalToasts: any[] | undefined = _;
	static isSceneOutAnimationRunning: boolean | undefined = _;
	static isSceneInAnimationRunning: boolean | undefined = _;
	static isOutAnimationRunning: boolean | undefined = _;
	static isInAnimationRunning: boolean | undefined = _;
	static incompatibleReason: string | undefined = _;
}

type KeyType = keyof typeof Contexts | string | number;

export class Ctx extends Contexts {
	public static BROADCAST_KEY: '*' = '*';
	public static items: Record<KeyType, Store<any>> = {};
	public static s: Record<Exclude<keyof typeof Contexts, 'prototype'>, any> = {} as any;

	public static getStore<T>(key?: KeyType): Store<T> {
		key ??= this.getCaller();

		if (this.items[key] == null) {
			this.items[key] = new Store<any>(undefined);
		}

		return this.items[key];
	}

	public static get<T>(key?: KeyType): T {
		return this.getStore<T>(key)?.value;
	}

	public static set<T>(
		key:
		| string
		| number
		| typeof Ctx.BROADCAST_KEY
		| NewableFunction,
		value: T,
	): void {
		key = this.getKey(key);

		if (this.items[key] == null) {
			this.items[key] = new Store(value);

			return;
		}

		this.items[key].set(value);
	}

	private static getCaller(): string {
		const stackFrames = StackTrace.getSync();

		for (let i = 0, l = stackFrames.length; i < l; ++i) {
			const { functionName } = stackFrames[i];
			const NEW_PREFIX = 'new ';

			if (
				functionName?.indexOf(NEW_PREFIX) === 0
				&& !functionName?.includes(Ctx.name)
			) {
				return functionName.substr(NEW_PREFIX.length);
			}
		}

		throw new UnexpectedValueError('Wasn\'t able to get function caller');
	}

	private static getKey(from: number | string | NewableFunction): string {
		return typeof from === 'function' ? from.name : String(from);
	}
}

Object.keys(Contexts).forEach((contextKey) => {
	Object.defineProperty(Ctx, contextKey, {
		get() {
			return Ctx.get(contextKey);
		},
		set(value) {
			Ctx.set(contextKey, value);
		},
	});
	Object.defineProperty(Ctx.s, contextKey, {
		get() {
			return Ctx.getStore(contextKey);
		},
		// set(value) {
		// 	Ctx.items[contextKey] = value;
		// },
	});
});
