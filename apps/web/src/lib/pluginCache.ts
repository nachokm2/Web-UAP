// Plugin mínimo: toda colección y global invalida la caché del sitio público
// (lib/cache.ts) con su propio nombre como etiqueta al guardarse o eliminarse.

import type { Config, Plugin } from 'payload'

import { invalidarCache } from './cache'

export const invalidarCacheAlCambiar: Plugin = (config: Config): Config => ({
  ...config,
  collections: (config.collections ?? []).map((c) => ({
    ...c,
    hooks: {
      ...c.hooks,
      afterChange: [...(c.hooks?.afterChange ?? []), ({ doc }) => (invalidarCache(c.slug), doc)],
      afterDelete: [...(c.hooks?.afterDelete ?? []), ({ doc }) => (invalidarCache(c.slug), doc)],
    },
  })),
  globals: (config.globals ?? []).map((g) => ({
    ...g,
    hooks: {
      ...g.hooks,
      afterChange: [...(g.hooks?.afterChange ?? []), ({ doc }) => (invalidarCache(g.slug), doc)],
    },
  })),
})
