import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'app/public/js/app.js',
  format: 'iife',
  sourcemap: true,
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};
