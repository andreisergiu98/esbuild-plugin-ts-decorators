import LRU from 'lru-cache';

interface CacheValue {
	hash: string;
	code: string;
	hasDecorators: boolean;
}

let cache = new LRU<string, CacheValue>({});

export function createCache(maxSize: number) {
	cache = new LRU<string, CacheValue>({
		max: maxSize * 1000000,
	});
}

export function getFromCache(path: string, hash: string) {
	const cached = cache.get(path);
	if (cached?.hash === hash) {
		return cached;
	}
}

export function setToCache(
	path: string,
	hash: string,
	output: string,
	hasDecorators: boolean
) {
	cache.set(path, {
		hash,
		code: output,
		hasDecorators,
	});
}
