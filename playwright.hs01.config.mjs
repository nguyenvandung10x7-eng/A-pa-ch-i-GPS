import {defineConfig} from '@playwright/test';
import baseline from './playwright.config.mjs';
export default defineConfig({...baseline,testDir:'./tests/phieng-loi-hs01',testIgnore:[],timeout:60000,maxFailures:0,
  outputDir:'./node_modules/.cache/task05-results',
  reporter:[['list'],['json',{outputFile:'./node_modules/.cache/task05-report/results.json'}],['html',{outputFolder:'./node_modules/.cache/task05-report/html',open:'never'}]],
  use:{...baseline.use,trace:'on',screenshot:'on',video:'on'},
});
