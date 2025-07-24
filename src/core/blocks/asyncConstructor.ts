import { IncorrectUsageError } from '../../resources/errors/incorrectUsage.error';

export class AsyncConstructor {
	private static isBeingInstantiated = false;

	protected constructor() {
		if (!(this.constructor as any).isBeingInstantiated) {
			throw new IncorrectUsageError('Constructor was called directly. (Use "await [class].new()" instead)');
		}

		(this.constructor as any).isBeingInstantiated = false;
	}

	public static async new<T = undefined>(...args: any[]): Promise<T> {
		this.brace();

		return undefined as any;
	}

	protected static brace(): void {
		this.isBeingInstantiated = true;
	}
}
