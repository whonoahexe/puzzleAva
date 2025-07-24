import {
	$,
	$$,
} from '../$.utility';
import { ForUtility } from '../for.utility';
import type { $Object } from '../types/$.object';

export class $Factory {
	public static create(objectToCreateFrom: any = {}): $Object {
		ForUtility.addToArrayPrototype();

		const object: $Object = {
			addClass(classNames): $Object {
				switch (classNames.constructor) {
					case String:
						(classNames as string).split(' ').fastEach((className: string) => {
							this.classList.add(className);
						});
						break;
					case Array:
						(classNames as string[]).fastEach((className: string) => {
							this.addClass(className);
						});
						break;
					default:
				}

				return this;
			},
			removeClass(classNames) {
				switch (classNames.constructor) {
					case String:
						(classNames as string).split(' ').fastEach((className: string) => {
							this.classList.remove(className);
						});
						break;
					case Array:
						(classNames as string[]).fastEach((className: string) => {
							this.removeClass(className);
						});
						break;
					default:
				}

				return this;
			},
			toggleClass(classNames) {
				switch (classNames.constructor) {
					case String:
						(classNames as string).split(' ').fastEach((className: string) => {
							this.classList.toggle(className);
						});
						break;
					case Array:
						(classNames as string[]).fastEach((className: string) => {
							this.toggleClass(className);
						});
						break;
					default:
				}

				return this;
			},
			css(
				property,
				value,
				options = {},
			) {
				// handle when the options are passed into the value argument
				if (value
					&& value.constructor === Object) {
					return this.css(property, undefined, value as typeof options);
				}

				let processedValue: string | Record<string, string>;
				let returnedValues: Record<string, string>;

				let propertyHasParentheses = false;
				let stackable = false;

				const unitlessProperties = [
					'opacity',
					'gridRowStart',
					'gridRowEnd',
					'columns',
					'columnCount',
				];
				const stackableProperties = [
					{
						name: 'transition',
						hasParentheses: false,
					},
					{
						name: 'transform',
						hasParentheses: true,
					},
				];

				switch (property.constructor) {
					case String:
					// determine if the property is a stackable one
						stackableProperties.fastEach(({
							name,
							hasParentheses,
						}) => {
						// return if the 'property' is not in 'stacakbleProperties'
							if (name !== property) {
								return;
							}

							stackable = true;
							propertyHasParentheses = hasParentheses;
						});

						if (value === undefined) {
						// the value of the property should be returned instead of set

							// @ts-expect-error obj[string]
							processedValue = this.style[property as string];

							if (options.computed) {
								// @ts-expect-error obj[string]
								processedValue = getValueWithoutUnit(getComputedStyle(this)[property as string]);
							}

							if (stackable
								&& options.returnAsObject) {
								processedValue = getAttributesFromValueString(
									processedValue as string,
									propertyHasParentheses,
								);
							}

							return processedValue;
						}
						// the value of the property should be set instead of returned

						processedValue = value as string;

						// if the value string is missing a unit, add px
						if (!unitlessProperties.includes(property as string)) {
							processedValue = getValueWithUnit(value as string);
						}

						if (stackable) {
						// create attribute objects from the value strings
							const oldAttributes = getAttributesFromValueString(
								// @ts-expect-error obj[string]
								this.style[(property as string)],
								propertyHasParentheses,
							);
							const newAttributes = getAttributesFromValueString(
								processedValue,
								propertyHasParentheses,
							);

							const processedAttributes = oldAttributes;

							Object.assign(processedAttributes, newAttributes);

							processedValue = getValueStringFromAttributes(
								processedAttributes,
								propertyHasParentheses,
							);
						}

						// @ts-expect-error obj[string]
						this.style[(property as string)] = processedValue;

						return this;
					case Array:
						if (value === undefined) {
							returnedValues = {};

							(property as string[]).fastEach((item: string) => {
								// @ts-expect-error obj[string]
								returnedValues[item] = this.css(item);
							});

							return returnedValues;
						}

						(property as string[]).fastEach((item: string, i: number) => {
							// @ts-expect-error string[number]
							this.css(item, value[i]);
						});

						return this;
					case Object:
						returnedValues = {};

						Object.keys(property as Record<string, string | number>).fastEach((key: string) => {
							// @ts-expect-error obj[string]
							const returnedValue = this.css(key, property[key]);

							if (returnedValue === this) {
								return;
							}

							// @ts-expect-error obj[string]
							returnedValues[key] = returnedValue;
						});

						return Object.keys(returnedValues).length === 0 ? this : returnedValues;
					default:
						return this.style;
				}

				function formatValueString(valueString: string): string {
					return valueString
						.toLowerCase()
						.replace(/\s/g, '');
				}

				function getValueWithoutUnit(valueWithUnit: string): string {
					if (!valueWithUnit.includes('px')) {
						return valueWithUnit;
					}

					return valueWithUnit.replace(/px/g, '');
				}

				function getValueWithUnit(valueWithoutUnit: string | number): string {
					if (valueWithoutUnit == null) {
						return valueWithoutUnit;
					}

					if (typeof valueWithoutUnit === 'number'
						|| !Number.isNaN(Number(valueWithoutUnit))) {
						return `${valueWithoutUnit}px`;
					}

					return valueWithoutUnit;
				}

				function getAttributesFromValueString(
					valueStringWithAttributes: string,
					hasParentheses: boolean,
				): Record<string, string> {
					let valueArrayWithAttributes: string[];
					let attributeKeys: string[];
					let attributeValues: string[];

					if (hasParentheses) {
						// split between ')' and remove ')' in the meantime
						valueArrayWithAttributes = formatValueString(valueStringWithAttributes)
							.split(')');

						// remove everything inside parentheses
						// regex is slower than native functions https://jsben.ch/8GY5K
						attributeKeys = valueArrayWithAttributes
							.map(
								(attribute) => attribute
									.substr(0, attribute.indexOf('('))
									.trim(),
							);

						// remove everything before and including '('
						// ')' was removed when we split it in 'valueArrayWithAttributes'
						attributeValues = valueArrayWithAttributes
							.map(
								(attribute) => attribute
									.substr(
										attribute.indexOf('(') + 1,
									),
							);
					} else {
						// split between and remove every ','
						valueArrayWithAttributes = formatValueString(valueStringWithAttributes)
							.split(',');

						// get the substring before anything that isn't an alphabet
						attributeKeys = valueArrayWithAttributes.map((attribute) => attribute
							.substring(0, attribute.search(/[^a-zA-Z]/)));

						// get the substring starting at the first character that isn't an alphabet
						attributeValues = valueArrayWithAttributes.map((attribute) => attribute
							.substr(attribute.search(/[^a-zA-Z]/)));
					}

					const attributeObject: Record<string, string> = {};

					attributeKeys.fastEach((key: string, i: number) => {
						if (!key) {
							return;
						}

						attributeObject[key] = attributeValues[i];
					});

					return attributeObject;
				}

				function getValueStringFromAttributes(
					attributes: Record<string, string>,
					hasParentheses: boolean,
				): string {
					let valueArray: string[];
					let valueString: string;

					if (hasParentheses) {
						valueArray = Object.keys(attributes).map(
							(attributeKey) => `${attributeKey}(${attributes[attributeKey]})`,
						);

						valueString = valueArray.join('');
					} else {
						valueArray = Object.keys(attributes).map(
							(attributeKey) => `${attributeKey}${attributes[attributeKey]}`,
						);

						valueString = valueArray.join(',');
					}

					return valueString;
				}
			},
			on(eventsStr: string, ...options: (string | string[] | ((event: Event) => unknown))[]) {
				const events: string[] = eventsStr.split(' ');
				let selector: string;
				let handler: (event: Event) => unknown;
				let eventOptions: EventListenerOptions = {};

				options.fastEach((option) => {
					switch (option.constructor) {
						case String:
							if (selector == null) {
								selector = option as string;
							}

							break;
						case Function:
							if (handler == null) {
								handler = option as (event: Event) => unknown;
							}

							break;
						case Object:
							if (Object.keys(eventOptions).length === 0) {
								eventOptions = option as EventListenerOptions;
							}

							break;
						default:
							break;
					}
				});

				events.fastEach((eventStr) => {
					this.addEventListener(
						eventStr,
						(event: Event) => {
							const processedEvent: Event = event;

							if (!event) {
								return handler(event);
							}

							const { target } = processedEvent;

							if (!target) {
								return null;
							}

							if (selector !== null
								&& !((target as any).matches?.(selector))) {
								return null;
							}

							return handler.call(target, processedEvent);
						},
						eventOptions,
					);
				});

				return this;
			},
			off(eventsStr: string, ...options: (string | string[] | ((event: Event) => unknown))[]) {
				const events: string[] = eventsStr.split(' ');
				let selector: string;
				let handler: (event: Event) => unknown;

				options.fastEach((option, i) => {
					switch (option.constructor) {
						case String:
							if (selector != null) {
								break;
							}

							selector = option as string;
							break;
						case Function:
							if (i !== options.length - 1) {
								break;
							}

							handler = option as (event: Event) => unknown;
							break;
						default:
							break;
					}
				});

				events.fastEach((eventStr) => {
					this.removeEventListener(eventStr, (event: Event) => {
						const processedEvent: Event = event;

						if (!event) {
							return handler(event);
						}

						const { target } = processedEvent;

						if (!target) {
							return null;
						}

						if (selector !== null
							&& !((target as any).matches?.(selector))) {
							return null;
						}

						return handler.call(target, processedEvent);
					});
				});

				return this;
			},
			async getJSON(url, callback) {
				const response = await fetch(url);

				return callback ? callback(await response.json()) : response.json();
			},
			$,
			$$,
			// workaround to keep the type
			...{} as any,
		};

		// ...spread doesn't work directly on dom objects apparently
		Object.assign(objectToCreateFrom, object);

		return objectToCreateFrom;
	}
}
