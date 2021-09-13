# esbuild-plugin-ts-decorators

This is a plugin for [esbuild](https://esbuild.github.io/) to handle the tsconfig setting `"emitDecoratorMetadata": true`.
When the decorator flag is set to `true`, the build process will inspect each `.ts` file and upon a decorator, will transpile with TypeScript.

In `watch` mode this plugin will cache those files by default, and rebuild them with TypeScript only if there are changes.

## Usage

Install esbuild and the plugin

```shell
npm install -D esbuild
npm install -D esbuild-plugin-ts-decorators
```

Set up a build script

```typescript
import { build } from 'esbuild';
import { esbuildDecorators } from 'esbuild-plugin-ts-decorators';

async function myBuilder(
	tsconfig: string,
	entryPoints: string[],
	outfile: string,
	cwd: string = process.cwd()
) {
	const buildResult = await build({
		platform: 'node',
		target: 'node14',
		bundle: true,
		sourcemap: 'external',
		plugins: [
			esbuildDecorators({
				tsconfig,
				cwd,
				cache: true,
			}),
		],
		watch: true,
		tsconfig,
		entryPoints,
		outfile,
		external: [
			// This is likely to be your friend...
		],
	});
}
```

Run your builder.

---

### Options

| Option        | Description                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **tsconfig**  | _optional_ : string : The path and filename of the tsconfig.json.                                             |
| **cwd**       | _optional_ : string : The current working directory.                                                          |
| **tsx**       | _optional_ : boolean : Enable `.tsx` file support. Default is `false`.                                        |
| **force**     | _optional_ : boolean : Will transpile decorators with TypeScript even if `emitDecoratorMetadata` is `false`.  |
| **cache**     | _optional_ : boolean : Whether to cache TypeScript builds in memory. Defaults to `true` when in `watch mode`. |
| **cacheSize** | _optional_ : number : Maximum size of the cache in MB. Defaults to `128 MB`.                                  |

---

### Caveats

There is no doubt that this will affect the performance of esbuild.
When `emitDecoratorMetadata` is set, every file will have to be loaded into this plugin.

This simple plugin hangs on the regex string: `/((?<![(\s]\s*['"])@\w[.[\]\w\d]*\s*(?![;])[((?=\s)])/`

Potentially esbuild could eventually do this regex search and expose positives via another plugin hook for transpiling.

Issue here: https://github.com/evanw/esbuild/issues/991

---

#### Decorator Match Testing

Check out the [test](https://github.com/anatine/esbuildnx/tree/main/packages/esbuild-decorators/src/__tests__/mock-project/app/src) files
and submit any issues or PRs if you see a pattern that should be covered.

---

#### Credits

Thanks to [Thomas Schaaf](https://github.com/thomaschaaf) and [Brian McBride](https://github.com/anatine) as this plugin is based on their code.
[Original Source](https://github.com/anatine/esbuildnx/tree/main/packages/esbuild-decorators)

Thanks to the npm package [strip-comments](https://www.npmjs.com/package/strip-comments)
that was stripped down to cover only typescript comments and string removals
