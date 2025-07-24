// copied from svelte's implementation

type Subscriber<T> = [(value: T) => void, () => void];

export class Store<T = unknown> {
	public subscribers: Subscriber<T>[] = [];
	public subscriberQueue: T[] = [];
	private stop: (() => void) | null = null;

	constructor(public value: T) {}

	private static neq(a: unknown, b: unknown): boolean {
		// eslint-disable-next-line no-self-compare, eqeqeq, no-negated-condition
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function') as boolean;
	}

	public set(newValue: T): void {
		if (Store.neq(this.value, newValue)) {
			this.value = newValue;

			this.trigger();
		}
	}

	public trigger(): void {
		if (!this.stop) {
			return;
		}

		// store is ready
		const runQueue = !this.subscriberQueue.length;

		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < this.subscribers.length; i += 1) {
			const s = this.subscribers[i];

			s[1]();
			// @ts-expect-error don't event know why
			this.subscriberQueue.push(s, this.value);
		}

		if (runQueue) {
			for (let i = 0; i < this.subscriberQueue.length; i += 2) {
				// @ts-expect-error
				this.subscriberQueue[i][0](this.subscriberQueue[i + 1]);
			}

			this.subscriberQueue.length = 0;
		}
	}

	public update(fn: (value: T) => T): void {
		this.set(fn(this.value));
	}

	public subscribe(run: (value: T) => void, invalidate = () => {}): () => void {
		const subscriber: Subscriber<T> = [run, invalidate];

		this.subscribers.push(subscriber);

		if (this.subscribers.length === 1) {
			this.stop = () => {};
		}

		run(this.value);

		return () => {
			this.unsubscribe(subscriber);
		};
	}

	public unsubscribe(subscriber: Subscriber<T>): void {
		const index = this.subscribers.indexOf(subscriber);

		if (index !== -1) {
			this.subscribers.splice(index, 1);
		}

		if (this.subscribers.length === 0) {
			this.stop?.();
			this.stop = null;
		}
	}
}
