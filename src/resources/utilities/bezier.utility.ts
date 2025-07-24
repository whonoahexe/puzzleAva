/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

export class BezierUtility {
	// These values are established by empiricism with tests (tradeoff: performance VS precision)
	private static readonly NEWTON_ITERATIONS = 4;
	private static readonly NEWTON_MIN_SLOPE = 0.001;
	private static readonly SUBDIVISION_PRECISION = 0.0000001;
	private static readonly SUBDIVISION_MAX_ITERATIONS = 10;
	private static readonly kSplineTableSize = 11;
	private static readonly kSampleStepSize = 1.0 / (BezierUtility.kSplineTableSize - 1.0);
	private static sampleValues: Float32Array | number[] = (
		typeof Float32Array === 'function')
		? new Float32Array(BezierUtility.kSplineTableSize)
		: new Array(BezierUtility.kSplineTableSize);

	constructor(
		private mX1: number,
		private mY1: number,
		private mX2: number,
		private mY2: number,
	) {
		if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
			throw new Error('bezier x values must be in [0, 1] range');
		}

		// if not LinearEasing
		if (mX1 !== mY1 || mX2 !== mY2) {
			// Precompute samples table
			for (let i = 0; i < BezierUtility.kSplineTableSize; ++i) {
				BezierUtility.sampleValues[i] = BezierUtility.calcBezier(
					i * BezierUtility.kSampleStepSize,
					mX1,
					mX2,
				);
			}
		}
	}

	private static getTForX(
		aX: number,
		mX1: number,
		mX2: number,
	): number {
		let intervalStart = 0.0;
		let currentSample = 1;
		const lastSample = BezierUtility.kSplineTableSize - 1;

		for (;
			currentSample !== lastSample && BezierUtility.sampleValues[currentSample] <= aX;
			++currentSample) {
			intervalStart += BezierUtility.kSampleStepSize;
		}

		--currentSample;

		// Interpolate to provide an initial guess for t
		const dist = (aX - BezierUtility.sampleValues[currentSample])
			/ (BezierUtility.sampleValues[currentSample + 1]
				- BezierUtility.sampleValues[currentSample]);
		const guessForT = intervalStart + (dist * BezierUtility.kSampleStepSize);

		const initialSlope = BezierUtility.getSlope(guessForT, mX1, mX2);

		if (initialSlope >= BezierUtility.NEWTON_MIN_SLOPE) {
			return BezierUtility.newtonRaphsonIterate(aX, guessForT, mX1, mX2);
		}

		if (initialSlope === 0.0) {
			return guessForT;
		}

		return BezierUtility.binarySubdivide(
			aX,
			intervalStart,
			intervalStart + BezierUtility.kSampleStepSize,
			mX1,
			mX2,
		);
	}

	private static a(
		aA1: number,
		aA2: number,
	): number {
		return 1.0 - (3.0 * aA2) + (3.0 * aA1);
	}

	private static b(
		aA1: number,
		aA2: number,
	): number {
		return (3.0 * aA2) - (6.0 * aA1);
	}

	private static c(
		aA1: number,
	): number {
		return 3.0 * aA1;
	}

	// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
	private static calcBezier(
		aT: number,
		aA1: number,
		aA2: number,
	): number {
		return (
			(
				(
					(
						BezierUtility.a(aA1, aA2)
						* aT
					)
					+ BezierUtility.b(aA1, aA2)
				)
			* aT
			)
			+ BezierUtility.c(aA1)
		)
		* aT;
	}

	// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
	private static getSlope(
		aT: number,
		aA1: number,
		aA2: number,
	): number {
		return (
			3.0
			* BezierUtility.a(aA1, aA2)
			* aT
			* aT
		)
		+ (
			(
				2.0
				* BezierUtility.b(aA1, aA2)
				* aT
			)
			+ BezierUtility.c(aA1)
		);
	}

	// eslint-disable-next-line max-params
	private static binarySubdivide(
		aX: number,
		aA: number,
		aB: number,
		mX1: number,
		mX2: number,
	): number {
		let currentX: number;
		let currentT: number;
		let i = 0;

		do {
			currentT = aA + ((aB - aA) / 2.0);
			currentX = BezierUtility.calcBezier(currentT, mX1, mX2) - aX;

			if (currentX > 0.0) {
				aB = currentT;
			} else {
				aA = currentT;
			}
		} while (Math.abs(currentX) > BezierUtility.SUBDIVISION_PRECISION
			&& ++i < BezierUtility.SUBDIVISION_MAX_ITERATIONS);

		return currentT;
	}

	private static newtonRaphsonIterate(
		aX: number,
		aGuessT: number,
		mX1: number,
		mX2: number,
	): number {
		for (let i = 0; i < BezierUtility.NEWTON_ITERATIONS; ++i) {
			const currentSlope = BezierUtility.getSlope(aGuessT, mX1, mX2);

			if (currentSlope === 0.0) {
				return aGuessT;
			}

			const currentX = BezierUtility.calcBezier(aGuessT, mX1, mX2) - aX;

			aGuessT -= currentX / currentSlope;
		}

		return aGuessT;
	}

	public at(
		value: number,
	): number {
		// LinearEasing
		if (this.mX1 === this.mY1
			&& this.mX2 === this.mY2) {
			return value;
		}

		// Because JavaScript number are imprecise, we should guarantee the extremes are right.
		if (value === 0 || value === 1) {
			return value;
		}

		// LinearEasing
		if (this.mX1 === this.mY1 && this.mX2 === this.mY2) {
			return value;
		}

		return BezierUtility.calcBezier(
			BezierUtility.getTForX(
				value,
				this.mX1,
				this.mX2,
			),
			this.mY1,
			this.mY2,
		);
	}
}
