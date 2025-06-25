import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'HandieHttp',
      exports: 'named',
      globals: {
        '@handie/runtime-core': 'HandieRuntimeCore',
        '@ntks/toolbox': 'NtksToolbox'
      }
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named'
    },
  ],
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
  ],
  external: ['@handie/runtime-core', '@ntks/toolbox']
};
