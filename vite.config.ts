import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		// Copy data files into /data in the build
		viteStaticCopy({
			targets: [
				{
					src: 'src/data/*.json',
					dest: '.',
					rename: { stripBase: 1 },
				},
			],
		}),
	],
});
