import { defineConfig } from '@playwright/test';
import baseline from './playwright.config.mjs';
export default defineConfig({...baseline,
  testMatch:['**/world-move.spec.mjs','**/world-contact.spec.mjs'],testIgnore:[],timeout:90000,
  outputDir:'./node_modules/.cache/task04-results',
  reporter:[['list'],['json',{outputFile:'./node_modules/.cache/task04-report/results.json'}],['html',{outputFolder:'./node_modules/.cache/task04-report/html',open:'never'}]],
  use:{...baseline.use,trace:'on',screenshot:'on'},
});
