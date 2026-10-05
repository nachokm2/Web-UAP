import * as migration_20261005_204554_inicial from './20261005_204554_inicial';
import * as migration_20261005_224454_origen_archivos from './20261005_224454_origen_archivos';
import * as migration_20261005_230949_campos_almacenamiento_s3 from './20261005_230949_campos_almacenamiento_s3';

export const migrations = [
  {
    up: migration_20261005_204554_inicial.up,
    down: migration_20261005_204554_inicial.down,
    name: '20261005_204554_inicial',
  },
  {
    up: migration_20261005_224454_origen_archivos.up,
    down: migration_20261005_224454_origen_archivos.down,
    name: '20261005_224454_origen_archivos',
  },
  {
    up: migration_20261005_230949_campos_almacenamiento_s3.up,
    down: migration_20261005_230949_campos_almacenamiento_s3.down,
    name: '20261005_230949_campos_almacenamiento_s3'
  },
];
