import * as migration_20261005_204554_inicial from './20261005_204554_inicial';
import * as migration_20261005_224454_origen_archivos from './20261005_224454_origen_archivos';

export const migrations = [
  {
    up: migration_20261005_204554_inicial.up,
    down: migration_20261005_204554_inicial.down,
    name: '20261005_204554_inicial',
  },
  {
    up: migration_20261005_224454_origen_archivos.up,
    down: migration_20261005_224454_origen_archivos.down,
    name: '20261005_224454_origen_archivos'
  },
];
