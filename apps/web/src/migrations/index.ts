import * as migration_20261005_204554_inicial from './20261005_204554_inicial';

export const migrations = [
  {
    up: migration_20261005_204554_inicial.up,
    down: migration_20261005_204554_inicial.down,
    name: '20261005_204554_inicial'
  },
];
