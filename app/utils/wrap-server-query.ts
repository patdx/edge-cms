import { get } from 'lodash-es';

type PromiseFulfilledResult<T> = {
	status: 'fulfilled';
	value: T;
};

type PromiseRejectedResult = {
	status: 'rejected';
	reason: any;
};

type PromiseSettledResult<T> =
	| PromiseFulfilledResult<T>
	| PromiseRejectedResult;

export const wrapServerQuery = async <T>(
	fn: () => T,
	options?: {
		/** set to true to test the error boudnary */
		throwError?: boolean;
	},
): Promise<PromiseSettledResult<Awaited<T>>> => {
	try {
		if (options?.throwError) {
			throw new Error('Test Error');
		}
		const value = await fn();
		return { status: 'fulfilled', value };
	} catch (error) {
		const cause = get(error, 'cause') as Error | undefined;
		console.log(error);
		if (cause) {
			console.log('Caused by:');
			console.log(cause);
		}

		return { status: 'rejected', reason: serializeError(error) };
	}
};

type ErrorLike = {
	name: string;
	message: string;
	cause?: ErrorLike;
};

const serializeError = (error?: any, level = 0): ErrorLike | undefined => {
	if (!error) return undefined;

	if (level >= 10) {
		return {
			name: 'Serialize Error Overflow',
			message: 'Too many levels',
		};
	}

	const cause = get(error, 'cause') as Error | undefined;

	const out: ErrorLike = {
		name: error.name,
		message: error.message,
	};

	const serializedCause = serializeError(cause, level + 1);

	if (serializedCause) out.cause = serializedCause;

	return out;
};

export const flattenError = (error?: ErrorLike): string[] => {
	if (!error) return [];

	const out: string[] = [];

	const { name, message, cause } = error;

	if (name) out.push(name);
	if (message) out.push(message);
	if (cause) out.push(...flattenError(cause));

	return out;
};
