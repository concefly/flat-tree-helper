import resolve from 'rollup-plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'FlatTreeHelper',
  },
  plugins: [commonjs(), resolve(), typescript({ tsconfig: './tsconfig.build.rollup.json' })],
};
