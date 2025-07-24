export class RandomUtility {
	public static int(
		length = 16,
	): number {
		return Number(
			new Array(length)
				.fill(null)
				.map(() => String(
					Math.floor(
						Math.min(
							Math.random() * 10,
							9,
						),
					),
				))
				.join(''),
		);
	}

	public static string(
		length = 16,
		charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
	): string {
		let result = '';
		const { length: charsetLength } = charset;

		for (let i = 0; i < length; i++) {
			result += charset.charAt(Math.floor(Math.random() * charsetLength));
		}

		return result;
	}
}

