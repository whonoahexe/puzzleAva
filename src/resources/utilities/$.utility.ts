import { $Factory } from './factories/$.factory';
import type { $Object } from './types/$.object';

class NotJQuery {
	// the object that is applied to can be just some random object
	$(objectToCreateFrom: any = {}): $Object {
		switch (true) {
			case this
				&& this.constructor === Object
				&& objectToCreateFrom.constructor === String:
				return $Factory.create(Object.values(this)
					.find((node: HTMLElement) => node.matches?.(objectToCreateFrom)));
			case objectToCreateFrom === undefined:
				return $Factory.create({});
			case objectToCreateFrom === null:
				throw new Error('Cannot create from null!');
			case objectToCreateFrom.constructor === String: {
				const queryResult = document.querySelector(objectToCreateFrom);

				return queryResult && $Factory.create(queryResult);
			}
			default:
				return $Factory.create(objectToCreateFrom);
		}
	}

	$$(objectToCreateFrom: any = {}): $Object[] {
		switch (true) {
			case this
				&& this.constructor === Object
				&& objectToCreateFrom.constructor === String:
				return Object.values(this)
					.getAll((node: HTMLElement) => node.matches?.(objectToCreateFrom))
					.map((elem: HTMLElement) => $Factory.create(elem));
			case objectToCreateFrom === undefined:
				return [$Factory.create({})];
			case objectToCreateFrom === null:
				throw new Error('Cannot create from null!');
			case objectToCreateFrom.constructor === String:
				return Array.from(
					document.querySelectorAll(objectToCreateFrom),
				).map(
					(elem) => $Factory.create(elem),
				);
			default:
				return [$Factory.create(objectToCreateFrom)];
		}
	}
}

export const {
	$,
	$$,
} = new NotJQuery();
