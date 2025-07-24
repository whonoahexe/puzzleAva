import { ClientError } from './client.error';

export class UnexpectedValueError extends ClientError {
	constructor(message: string) {
		super(`An unexpected value was encountered${message ? `: ${message}` : ''}`);
	}
}
