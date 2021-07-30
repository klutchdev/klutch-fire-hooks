import { resolve } from 'path';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import resolveModule from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';
import authPkg from './auth/package.json';
import firestorePkg from './firestore/package.json';
import storagePkg from './storage/package.json';

const pkgsByName = {
  auth: authPkg,
  firestore: firestorePkg,
  storage: storagePkg,
};

const plugins = [
  resolveModule(),
  typescript({
    typescript: require('typescript'),
  }),
  commonjs(),
];

const peerDependencies = pkg.peerDependencies || {};
const external = [
  ...Object.keys(peerDependencies),
  'firebase/auth',
  'firebase/firestore',
  'firebase/storage',
];

const components = ['auth', 'firestore', 'storage'];

export default components
  .map((component) => {
    const pkg = pkgsByName[component];
    return [
      {
        input: `${component}/index.ts`,
        output: [
          { file: resolve(component, pkg.main), format: 'cjs' },
          { file: resolve(component, pkg.module), format: 'es' },
        ],
        plugins,
        external,
      },
      {
        input: `${component}/index.ts`,
        output: {
          file: `dist/klutch-firebase-hooks-${component}.js`,
          format: 'iife',
          sourcemap: true,
          extend: true,
          name: 'klutch-firebase-hooks',
          globals: {
            react: 'react',
            auth: 'auth',
          },
        },
        plugins: [
          ...plugins,
          terser(),
          // Copy flow files
          copy({
            [`${component}/index.js.flow`]: `${component}/dist/index.cjs.js.flow`,
          }),
          copy({
            [`${component}/index.js.flow`]: `${component}/dist/index.esm.js.flow`,
          }),
        ],
        external,
      },
    ];
  })
  .reduce((a, b) => a.concat(b), []);
