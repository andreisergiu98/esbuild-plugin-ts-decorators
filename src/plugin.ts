import type { Plugin } from 'esbuild';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { transpileModule } from 'typescript';

import { getHash } from './hash';
import { findDecorators } from './finder';
import { parseTsConfig, printDiagnostics } from './ts-utils';
import { getFromCache, setToCache, createCache } from './cache';

export interface EsbuildDecoratorsOptions {
	/**
	 * @description Working directory of tsconfig
	 */
	cwd?: string;

	/**
	 * @description The path and filename of the tsconfig.json
	 */
	tsconfig?: string;

	/**
	 * @default false *\/
	 * @description Enable .tsx file support
	 */
	tsx?: boolean;

	/**
	 * @default false *\/
	 * @description Transpiles decorators even if 'emitDecoratorMetadata' is false.
	 */
	force?: boolean;

	/**
	 * @description Caches typescript builds in memory.
	 */
	cache?: boolean;

	/**
	 * @default 128
	 * @description Maximum size of the cache in MB
	 */
	cacheSize?: number;
}

export const esbuildDecorators = (options: EsbuildDecoratorsOptions = {}): Plugin => ({
	name: 'tsc',
	async setup(build) {
		const {
			cwd = process.cwd(),
			tsx = false,
			force = false,

			tsconfig = build.initialOptions?.tsconfig,

			cache = build.initialOptions?.watch ?? false,
			cacheSize = 128,
		} = options;

		const parsedTsConfig = parseTsConfig(tsconfig || join(cwd, './tsconfig.json'), cwd);

		let filter = /\.ts$/;
		if (tsx) {
			filter = /\.tsx?$/;
		}

		createCache(cacheSize);

		build.onLoad({ filter }, async ({ path }) => {
			// Just return if we don't need to search the file.
			if (!force && !parsedTsConfig.options.emitDecoratorMetadata) {
				return;
			}

			const file = await readFile(path, 'utf8').catch((err) =>
				printDiagnostics({ file: path, err })
			);

			if (!file) {
				return;
			}

			let hash;
			let cached;

			if (cache) {
				hash = getHash(file);
				cached = getFromCache(path, hash);
			}

			if (cached?.hasDecorators === false) {
				return;
			}

			if (cached) {
				return { contents: cached.code };
			}

			const hasDecorators = findDecorators(file);
			if (!hasDecorators) {
				if (cache) {
					setToCache(path, hash, '', hasDecorators);
				}
				return;
			}

			const code = transpileModule(file, {
				compilerOptions: parsedTsConfig.options,
			}).outputText;

			if (cache) {
				setToCache(path, hash, code, hasDecorators);
			}

			return { contents: code };
		});
	},
});
