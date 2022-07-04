/// <reference types="vitest" />
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import inject from '@rollup/plugin-inject';
import vue from '@vitejs/plugin-vue';
import * as fs from 'fs';
import * as path from 'path';
import { UserConfig, defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  const buildDate = new Date().toISOString();
  const performanceEnabled = false;

  // Replace these values when using a remote backend
  // Host/port are also defined in dev/utils.js
  let apiProtocol: 'http' | 'https' | undefined = undefined;
  let apiHost: string | undefined = undefined;
  let apiPort: number | undefined = undefined;

  if (command === 'serve') {
    apiPort = 9001;
  }

  if (mode === 'test') {
    apiProtocol = 'http';
    apiHost = 'localhost';
    apiPort = 9001;
  }

  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),

      quasar({
        sassVariables: 'src/css/quasar.variables.sass',
      }),
    ],

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
      https: {
        key: fs.readFileSync('./dev/traefik/brewblox.key'),
        cert: fs.readFileSync('./dev/traefik/brewblox.crt'),
      },
    },

    build: {
      rollupOptions: {
        plugins: [
          inject({ Buffer: ['buffer', 'Buffer'], process: 'process/browser' }),
        ],
      },
    },

    test: {
      environment: 'jsdom',
    },
  };
});
