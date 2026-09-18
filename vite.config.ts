import { defineConfig } from 'vite';
import vinext from 'vinext';
import { cloudflare } from '@cloudflare/vite-plugin';
import { cdnAdapter } from '@vinext/cloudflare/cache/cdn-adapter';
import { imagesOptimizer } from '@vinext/cloudflare/images/images-optimizer';
import { kvDataAdapter } from '@vinext/cloudflare/cache/kv-data-adapter';

export default defineConfig({
  plugins: [
    vinext({
      cache: { data: kvDataAdapter(), cdn: cdnAdapter() },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: 'rsc',
        childEnvironments: ['ssr'],
      },
    }),
  ],
});
