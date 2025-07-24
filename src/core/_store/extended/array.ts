import { StoreExtendable } from '../extendable';

export interface StoreArray<T = unknown> extends StoreExtendable<Array<T>>, Array<T> {}

export class StoreArray<T = unknown> extends StoreExtendable<Array<T>> {
	constructor(length = 0) {
		super(new Array(length));
	}

	public get length(): number {
		return this.value.length;
	}

	public remove(...items: T[]): void {
		items.forEach((item) => {
			this.value.splice(this.value.indexOf(item), 1);
		});

		this.trigger();
	}

	public setAt(index: number, newValue: T): void {
		this.value[index] = newValue;

		this.trigger();
	}

	public getAt(index: number): T {
		return this.value[index];
	}

	public push(...items: T[]): number {
		const result = this.value.push(...items);

		this.trigger();

		return result;
	}

	public pop(): T | undefined {
		const result = this.value.pop();

		this.trigger();

		return result;
	}

	public shift(): T | undefined {
		const result = this.value.shift();

		this.trigger();

		return result;
	}

	public unshift(...items: T[]): number {
		const result = this.value.unshift(...items);

		this.trigger();

		return result;
	}

	public splice(start: number, deleteCount?: number): T[] {
		const result = this.value.splice(start, deleteCount);

		this.trigger();

		return result;
	}

	public reverse(): T[] {
		const result = this.value.reverse();

		this.trigger();

		return result;
	}

	public sort(compareFn?: (a: T, b: T) => number): this {
		this.value.sort(compareFn);

		this.trigger();

		return this;
	}
}
