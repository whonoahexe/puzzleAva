import { UnexpectedValueError } from '../resources/errors/unexpectedValue.error';

export class Shadow {
	public static apply(depth: number, node: HTMLElement): void {
		if (node == null) {
			throw new UnexpectedValueError('node is nullish');
		}

		const processedBoxShadow = this.get(depth);

		node
			.style
			.setProperty(
				'--shadow',
				processedBoxShadow.active,
			);

		node
			.style
			.setProperty(
				'--shadow-inactive',
				processedBoxShadow.inactive,
			);
	}

	public static get(depth: number): typeof processedBoxShadow {
		const isDrop = depth > 0;
		const boxShadowProperty = isDrop
			? '--box-shadow-drop'
			: '--box-shadow-inner';
		const boxShadow = getComputedStyle(document.documentElement)
			.getPropertyValue(boxShadowProperty)
			.trim();
		const boxShadowParts = boxShadow.includes('rgba(') || boxShadow.includes('hsla(')
			? boxShadow
				.replace(/\)\s*,/g, ')__delim__')
				.split('__delim__')
			: boxShadow
				.split(',');

		const blur = Math.abs(depth) * 20;
		const darkX = blur / 3;
		const darkY = darkX;
		const brightX = -darkX;
		const brightY = brightX;
		const rgba = boxShadowParts.map(
			(boxShadowPart) => {
				const indexOfRGBA = boxShadowPart
					.trim()
					.indexOf('rgba(');
				const indexOfHSLA = boxShadowPart
					.trim()
					.indexOf('hsla(');
				const workingRgba = boxShadowPart
					.trim()
					.substr(
						indexOfRGBA < 0
							? indexOfHSLA
							: indexOfRGBA,
					);

				const alpha = Number.parseFloat(
					workingRgba
						.substring(
							workingRgba.lastIndexOf(',') + 1,
							workingRgba.lastIndexOf(')'),
						)
						.trim(),
				) * (Math.abs(depth) / 3);

				return `${workingRgba.substr(0, workingRgba.lastIndexOf(',') + 1)} ${alpha})`;
			},
		);

		const darkBoxShadowParts = this.getParts(darkX, darkY, blur, rgba[0]);
		const darkBoxShadowPartsInactive = this.getParts(0, 0, 0, rgba[0]);
		const brightBoxShadowParts = this.getParts(brightX, brightY, blur, rgba[1]);
		const brightBoxShadowPartsInactive = this.getParts(0, 0, 0, rgba[1]);

		const processedBoxShadow = {
			active: this.getProcessedBoxShadow(
				isDrop,
				darkBoxShadowParts,
				brightBoxShadowParts,
			),
			inactive: this.getProcessedBoxShadow(
				isDrop,
				darkBoxShadowPartsInactive,
				brightBoxShadowPartsInactive,
			),
		};

		return processedBoxShadow;
	}

	private static getParts(
		x: number,
		y: number,
		blur: number,
		rgba: string,
	): string[] {
		return [
			`${x}px`,
			`${y}px`,
			`${blur}px`,
			rgba,
		];
	}

	private static getProcessedBoxShadow(
		isDrop: boolean,
		darkBoxShadowParts: string[],
		brightBoxShadowParts: string[],
	): string {
		return `${isDrop ? '' : 'inset'} ${darkBoxShadowParts.join(' ')}, ${isDrop ? '' : 'inset'} ${brightBoxShadowParts.join(' ')}`;
	}
}
