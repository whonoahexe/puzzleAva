import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy-assets';
import del from 'rollup-plugin-delete';
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import childProcess from 'child_process';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
// import ignore from 'rollup-plugin-ignore';
import cssnano from 'cssnano';
import postcssImportURL from 'postcss-import-url';
import { sveltePreprocess } from 'svelte-preprocess/dist/autoProcess';
import analyze from 'rollup-plugin-analyzer';
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;
const onwarn = (message, warn) => {
	const ignored = {
		EVAL: ['node_modules', 'lottie'],
		CIRCULAR_DEPENDENCY: [''],
	};
	const ignoredKeys = Object.keys(ignored);
	const ignoredValues = Object.values(ignored);

	for (let i = 0, l = ignoredKeys.length; i < l; ++i) {
		const ignoredKey = ignoredKeys[i];
		const ignoredValue = ignoredValues[i];

		for (const ignoredValuePart of ignoredValue) {
			if (message.code !== ignoredKey
				|| !message.toString().includes(ignoredValuePart)) {
				continue;
			}

			return;
		}
	}

	warn(message);
};

const watch = {
	clearScreen: false,
};

export default (commandLineArgs) => [
	{
		treeshake: false,
		input: 'src/index.ts',
		output: {
			sourcemap: !production,
			format: 'es',
			name: 'app',
			dir: 'public',
		},
		onwarn,
		watch,
		plugins: [
			production && del({
				targets: ['public'],
				suppressErrors: true,
			}),

			copy({
				assets: [
					// common assets
					'resources/raw',

					...(production
						// prod-only assets
						? [
							'index.html',
							'_redirects',
						]
						// dev-only assets
						: []),
				],
			}),

			json({
				compact: production,
				preferConst: true,
			}),

			svelte({
				preprocess: sveltePreprocess(),
				compilerOptions: {
					accessors: true,
					// enable run-time checks when not in production
					dev: !production,
				},
			}),

			postcss({
				plugins: [
					postcssImport(),
					postcssImportURL({
						modernBrowser: true,
					}),
					production && cssnano({
						preset: [
							'default',
							{
								cssDeclarationSorter: true,
							},
						],
					}),
				],
				extract: 'bundle.css',
			}),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration -
			// consult the documentation for details:
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			resolve({
				browser: true,
				dedupe: ['svelte'],
			}),

			typescript({
				outDir: 'public',
				sourceMap: !production,
			}),

			commonjs(),

			production && babel({
				extensions: [
					'.js',
					'.mjs',
					'.html',
					'.svelte',
				],
				include: ['src/**', 'node_modules/svelte/**'],
				babelHelpers: 'bundled',
				sourceMaps: !production,
			}),

			// In dev mode, call `npm run start` once
			// the bundle has been generated
			!production && serve(),

			// Watch the `public` directory and refresh the
			// browser on changes when not in production
			!production && !commandLineArgs['config-electron'] && livereload('public'),

			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser({
				keep_classnames: true,
			}),

			analyze({
				summaryOnly: true,
				limit: 10,
			}),
		],
	},
].filter((config) => Boolean(config));

function serve(
	npmScript = [
		'serve',
		'--',
		'--dev',
	],
) {
	let server;

	function toExit() {
		if (server) {
			server.kill(0);
		}
	}

	return {
		writeBundle() {
			if (server) {
				return;
			}

			server = childProcess.spawn('npm', ['run', ...npmScript], {
				stdio: [
					'ignore',
					'inherit',
					'inherit',
				],
				shell: true,
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		},
	};
}
