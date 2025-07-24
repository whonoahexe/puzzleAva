import { Store } from '../store';

export class StoreExtendable<T = unknown> extends Store<T> {
	constructor(value: T) {
		super(value);

		const valueDescriptors = Object.getOwnPropertyDescriptors(this.value);
		const prototypeDescriptors = Object.getOwnPropertyDescriptors(
			(this.value as any)
				?.constructor
				?.prototype
			?? {},
		);
		const descriptors = {
			...prototypeDescriptors,
			...valueDescriptors,
		};

		Object.keys(descriptors).forEach((descriptorKey) => {
			// @ts-expect-error
			if (this[descriptorKey] != null) {
				return;
			}

			const {
				value: descriptorValue,
			} = descriptors[descriptorKey];

			descriptors[descriptorKey].value = (
				descriptorValue as (...args: any) => any
			)
				?.bind?.(this.value) ?? descriptorValue;

			Object.defineProperty(this, descriptorKey, descriptors[descriptorKey]);
		});
	}
}
