import crypto from 'crypto';

export function getHash(input: string) {
	return crypto.createHash('sha256').update(input).digest('hex').toString();
}
