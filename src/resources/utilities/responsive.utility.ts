import { Store } from '../../core/store';

enum ResponsiveClasses {
	MOBILE = 'mobile',
	TABLET = 'tablet',
	POTATO = 'potato',
	DESKTOP = 'desktop',
}

enum ResponsiveBreakpoints {
	MOBILE = 0,
	TABLET = 560,
	POTATO = 1024,
	DESKTOP = 1280,
}

enum ResponsiveStages {
	MOBILE,
	TABLET,
	POTATO,
	DESKTOP,
}

export class ResponsiveUtility {
	private static nodes: Element[] = [];
	public static isListenerActive = false;
	private static classes = Object.values(ResponsiveClasses).join(' ');
	public static Breakpoints = ResponsiveBreakpoints;
	public static Classes = ResponsiveClasses;
	public static Stages = ResponsiveStages;
	public static currentBreakpointKeyWritable: Store<string> = new Store('');
	public static currentBreakpointWritable: Store<number> = new Store(0);

	public static apply(node: HTMLBaseElement): void {
		this.nodes.push(node);

		this.refresh(this.nodes.length - 1);
	}

	private static refresh(index?: number): void {
		const nodesToRefresh = (() => {
			if (index) {
				return [this.nodes[index]];
			}

			return this.nodes;
		})();

		nodesToRefresh.forEach((node) => {
			this.setCurrentBreakpointClass(node);
		});
	}

	private static setCurrentBreakpointClass(node: Element): void {
		// @ts-expect-error obj[string]
		this.setClass(ResponsiveClasses[this.currentBreakpointKeyWritable.value], node);
	}

	private static setClass(className: ResponsiveClasses, node: Element): void {
		node.classList.remove(...Object.values(ResponsiveClasses));
		node.classList.add(className);
	}

	public static onResize(): void {
		let result!: string;

		Object.keys(ResponsiveBreakpoints).forEach((responsiveBreakpointKey) => {
			// @ts-expect-error obj[string]
			if (window.innerWidth / devicePixelRatio > ResponsiveBreakpoints[responsiveBreakpointKey]) {
				result = responsiveBreakpointKey;
			}
		});

		if (result === ResponsiveUtility.currentBreakpointKeyWritable.value) {
			return;
		}

		ResponsiveUtility.currentBreakpointKeyWritable.set(result);
		// @ts-expect-error enum[string]
		ResponsiveUtility.currentBreakpointWritable.set(ResponsiveBreakpoints[result]);
		ResponsiveUtility.refresh();
	}
}

if (typeof window !== String(undefined)
	&& !ResponsiveUtility.isListenerActive) {
	ResponsiveUtility.onResize();
	window.addEventListener('resize', ResponsiveUtility.onResize);

	ResponsiveUtility.isListenerActive = true;
}
