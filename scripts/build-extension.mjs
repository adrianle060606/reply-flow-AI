import { build } from 'vite';
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectContentMatches } from './collect-matches.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function manifest() {
  const matches = collectContentMatches(root);
  return {
    manifest_version: 3,
    name: 'ReplyMe',
    version: '1.0.0',
    description: 'AI communication copilot for Gmail, Slack, WhatsApp, Discord, and more.',
    icons: {
      16: 'icons/icon16.png',
      32: 'icons/icon32.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
    action: {
      default_title: 'ReplyMe',
      default_popup: 'popup.html',
      default_icon: {
        16: 'icons/icon16.png',
        32: 'icons/icon32.png',
        48: 'icons/icon48.png',
      },
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
    content_scripts: [
      {
        matches,
        js: ['content.js'],
        run_at: 'document_idle',
      },
    ],
    permissions: ['storage', 'activeTab', 'scripting', 'sidePanel'],
    host_permissions: matches,
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Ctrl+Shift+Y',
          mac: 'Command+Shift+Y',
        },
        description: 'Open ReplyMe',
      },
    },
    side_panel: {
      default_path: 'popup.html',
    },
  };
}

async function main() {
  await build({
    configFile: resolve(root, 'vite.extension-ui.config.ts'),
  });

  await build({
    configFile: false,
    root,
    resolve: {
      alias: { '@': resolve(root, 'src') },
    },
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        entry: resolve(root, 'src/background/index.ts'),
        formats: ['es'],
        fileName: () => 'background.js',
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  });

  await build({
    configFile: false,
    root,
    resolve: {
      alias: { '@': resolve(root, 'src') },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        entry: resolve(root, 'src/content/index.ts'),
        name: 'ReplyMeContent',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  });

  const dist = resolve(root, 'dist');
  const iconsSrc = resolve(root, 'public/icons');
  const iconsDest = resolve(dist, 'icons');
  mkdirSync(iconsDest, { recursive: true });
  for (const name of ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png']) {
    const from = resolve(iconsSrc, name);
    if (!existsSync(from)) {
      throw new Error(`Missing ${from}. Run the icon generator first.`);
    }
    copyFileSync(from, resolve(iconsDest, name));
  }

  writeFileSync(resolve(dist, 'manifest.json'), JSON.stringify(manifest(), null, 2));
  console.log('Extension written to dist/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
