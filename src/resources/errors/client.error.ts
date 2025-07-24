export class ClientError extends Error {
	constructor(message = 'No message provided, an error with errors?') {
		super(message);
		this.name = this.constructor.name;
		(Error as any).captureStackTrace?.(this, this.constructor);
	}
}
