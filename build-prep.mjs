import fs from 'node:fs/promises';

await fs.mkdir('build/data');
await fs.cp('src/data', 'build/data', {recursive: true});
