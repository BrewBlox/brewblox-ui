/// <reference types="vitest" />
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import inject from '@rollup/plugin-inject';
import vue from '@vitejs/plugin-vue';
import * as fs from 'fs';
import { ServerOptions } from 'https';
import * as path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, PluginOption, UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  const buildDate = new Date().toISOString();
  const performanceEnabled = false;

  const isTest = mode === 'test';
  const isDev = mode === 'development' && command === 'serve';

  // Host/port are also hardcoded in dev/utils.js
  let apiProtocol: 'http' | 'https' | undefined = undefined;
  let apiHost: string | undefined = undefined;
  let apiPort: number | undefined = undefined;
  let serverHttps: ServerOptions | boolean = false;

  const plugins: PluginOption[] = [
    vue({
      template: { transformAssetUrls },
    }),

    quasar({
      sassVariables: 'src/css/variables.sass',
    }),
  ];

  if (isTest) {
    apiProtocol = 'http';
    apiHost = 'localhost';
    apiPort = 9001;
    serverHttps = false;
  }

  if (isDev) {
    apiProtocol = undefined;
    apiHost = undefined;
    apiPort = 9001;
    serverHttps = {
      key: fs.readFileSync('./dev/traefik/brewblox.key'),
      cert: fs.readFileSync('./dev/traefik/brewblox.crt'),
    };

    // Disabled because it fails to infer types from global components
    //
    // plugins.push(
    //   CheckerPlugin({
    //     typescript: true,
    //     vueTsc: true,
    //     eslint: {
    //       lintCommand:
    //         'eslint --ext .js,.ts,.vue --ignore-path .gitignore ./src ./test',
    //     },
    //   }),
    // );
  }

  // Enable this manually when desired
  if (false) {
    plugins.push(visualizer() as unknown as PluginOption);
  }

  return {
    plugins,

    resolve: {
      alias: {
        // We're only using a subset from plotly
        // Add alias to enable typing regardless
        'plotly.js': path.resolve(__dirname, './plotly-bundle'),
        // The bundler file still needs access to the actual plotly module
        'plotly-dist': path.resolve(__dirname, './node_modules/plotly.js'),

        // This matches the @ alias set in tsconfig.json
        '@': path.resolve(__dirname, './src'),
      },
    },

    define: {
      __BREWBLOX_BUILD_DATE: JSON.stringify(buildDate),
      __BREWBLOX_PERFORMANCE: JSON.stringify(performanceEnabled),
      __BREWBLOX_API_PROTOCOL: JSON.stringify(apiProtocol),
      __BREWBLOX_API_HOST: JSON.stringify(apiHost),
      __BREWBLOX_API_PORT: JSON.stringify(apiPort),
    },

    base: '/ui/',

    server: {
      open: false,
      host: '0.0.0.0',
      port: 8080,
      base: '/ui/',
      https: serverHttps,
    },

    build: {
      rollupOptions: {
        plugins: [
          inject({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          }) as any,
        ],
      },
    },

    test: {
      environment: 'jsdom',
      setupFiles: ['test/setup.ts'],
    },
  };
});
