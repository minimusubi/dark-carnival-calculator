import fs from 'node:fs/promises';

await fs.mkdir('build/data');
await fs.cp('src/data', 'build/data', {recursive: true});
await fs.cp('404.html', 'build/404.html');
