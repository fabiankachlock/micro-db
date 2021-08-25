import fs from 'fs';

export const sleep = (timeout: number) => new Promise(resolve => setTimeout(() => resolve({}), timeout));

export const readFile = (path: string): string => fs.readFileSync(path).toString();

test('', () => {});
