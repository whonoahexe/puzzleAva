import { StoreExtendable } from '../extendable';

export interface StoreSet<T = unknown> extends StoreExtendable<Set<T>>, Set<T> {}

export class StoreSet<T = unknown> extends StoreExtendable<Set<T>> {
	private setLength = 0;

	constructor(iterable?: Iterable<T>) {
		super(new Set(iterable));
	}

	public add(value: T): this {
		this.value.add(value);

		if (this.value.size !== this.setLength) {
			this.trigger();
		}

		return this;
	}

	public delete(value: T): boolean {
		const result = this.value.delete(value);

		if (result) {
			this.trigger();
		}

		return result;
	}

	public clear(): void {
		this.value.clear();

		this.trigger();
	}

	// public has = this.value.has;
	// public entries = this.value.entries;
	// public forEach = this.value.forEach
	// public keys = this.value.keys;
	// public values = this.value.values;
	// public size = this.value.size;
	// [Symbol.iterator] = this.value[Symbol.iterator];
	// [Symbol.toStringTag] = this.value[Symbol.toStringTag];
}
