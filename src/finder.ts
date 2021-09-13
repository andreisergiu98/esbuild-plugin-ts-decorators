import { strip } from './strip-it';

const theFinder = new RegExp(/((?<![(\s]\s*['"])@\w[.[\]\w\d]*\s*(?![;])[((?=\s)])/);

export function findDecorators(fileContent: string) {
	return theFinder.test(strip(fileContent));
}
