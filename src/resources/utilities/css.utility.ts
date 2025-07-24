/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IncorrectUsageError } from '../errors/incorrectUsage.error';
import { WindowUtility } from './window.utility';
import { UnexpectedValueError } from '../errors/unexpectedValue.error';

export type CSS = string | number;

export class CSSUtility {
	public static parse(value: CSS): string {
		switch (true) {
			case value == null:
				return '0px';
			// @ts-expect-error string[number]
			case value[0] === '-'
			// @ts-expect-error string[number]
				&& value[1] === '-':
				return `var(${value})`;
			case this.isNumber(value):
				return `${value}px`;
			default:
				return value as string;
		}
	}

	public static unparse(value: string, ctx?: HTMLElement): number {
		switch (true) {
			case value == null:
				return 0;
			case this.isNumber(value):
				return Number(value);
			case value[value.length - 1] === '%':
				this.assertCtx(ctx);

				// it is very much not null because of the assert
				return ctx!.clientWidth * (Number.parseFloat(value as string) / 100);
			case this.isSingularValue(value, 'px'):
				return Number.parseFloat(value);
			case this.isSingularValue(value, 'vh'):
				return WindowUtility.viewport.height;
			case this.isSingularValue(value, 'vw'):
				return WindowUtility.viewport.width;
			case this.isSingularValue(value, 'vmax'):
				return Math.max(WindowUtility.viewport.height, WindowUtility.viewport.width);
			case this.isSingularValue(value, 'vmin'):
				return Math.min(WindowUtility.viewport.height, WindowUtility.viewport.width);
			case (value as string).indexOf('var(--') === 0:
				this.assertCtx(ctx);

				return Number(this.getVariable(value as string, ctx!));
			default:
				this.assertCtx(ctx);

				return this.getComputed(value as string, ctx!);
		}
	}

	public static getVariable(variable: string, ctx: HTMLElement = document.documentElement): string {
		return getComputedStyle(ctx)
			.getPropertyValue(
				variable
					.replace(/^var\(/, '')
					.replace(/\)$/, ''),
			)
			.trim();
	}

	public static isSingularValue(value: string, suffix: string): boolean {
		return this.isNumber(value.replace(suffix, ''));
	}

	public static getComputed(value: string, ctx: HTMLElement): number {
		// @ts-expect-error obj[string]
		ctx.style['x'] = value;

		// @ts-expect-error obj[string]
		const result = Number.parseFloat(getComputedStyle(ctx)['x']);

		// @ts-expect-error obj[string]
		ctx.style['x'] = null;

		if (Number.isNaN(result)) {
			throw new UnexpectedValueError('result === NaN');
		}

		return result;
	}

	private static assertCtx(ctx: HTMLElement | undefined): void | never {
		if (ctx != null) {
			return;
		}

		throw new IncorrectUsageError(`ctx === ${ctx}`);
	}

	public static isNumber(value: unknown): boolean {
		return !Number.isNaN(Number(value));
	}
}
