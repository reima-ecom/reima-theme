/* eslint-disable import/no-extraneous-dependencies */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import glob from 'glob-promise';
import { promises as fs } from 'fs';
import __import__ from './rollup-plugin-dynamic-import.js';

const SOURCE = 'src';
const OUTPUT = 'public';

const cleanOutputAndGetConfig = async (srcDir, outputDir) => {
  await fs.rmdir(outputDir, { recursive: true });
  const files = await glob(`${srcDir}/*.js`);
  return {
    input: files,
    output: {
      dir: outputDir,
      format: 'es',
    },
    plugins: [
      resolve({ mainFields: ['unpkg', 'browser', 'module', 'main'], preferBuiltins: false }),
      __import__(),
      commonjs(),
    ],
  };
};

export default cleanOutputAndGetConfig(SOURCE, OUTPUT);
