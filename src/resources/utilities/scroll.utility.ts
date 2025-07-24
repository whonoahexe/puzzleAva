import { $ } from './$.utility';

export class ScrollUtility {
	public static isDisabled = false;

	public static target = document.body;

	public static disable(): void {
		if (ScrollUtility.isDisabled) {
			return;
		}

		$(document.body).css({
			overflow: 'hidden',
			width: '100vw',
		});
	}

	public static enable(): void {
		if (!ScrollUtility.isDisabled) {
			return;
		}

		$(document.body).css({
			overflow: 'unset',
			width: '100%',
		});
	}
}
