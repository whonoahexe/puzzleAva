export interface $Object extends HTMLUnknownElement {
	addClass: (classNames: string | string[]) => $Object;
	removeClass: (classNames: string | string[]) => $Object;
	toggleClass: (classNames: string | string[]) => $Object;
	css: (
		property: string | string[] | Record<string, string | number>,
		value?: number | string | string[] | {
			computed?: boolean;
			returnAsObject?: boolean;
		},
		options?: {
			computed?: boolean;
			returnAsObject?: boolean;
		},
	) => string | Record<string, string> | $Object;
	on: (
		events: string,
		selector?: string | unknown | ((event: Event) => unknown),
		handler?: string | unknown | ((event: Event) => unknown),
		eventOptions?: EventListenerOptions,
	) => $Object;
	off: (
		events: string,
		selector?: string | unknown | ((event: Event) => unknown),
		data?: string | unknown | ((event: Event) => unknown),
		handler?: string | unknown | ((event: Event) => unknown),
	) => $Object;
	getJSON: (
		url: string,
		callback?: (json: Record<string, any>) => unknown,
	) => Promise<Record<string | number, any>>;
}
