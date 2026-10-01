import {defineConfig} from '@playwright/test';
import baseline from './playwright.config.mjs';

// Separate blocker regressions; never change the 44/28/46 acceptance counts.
export default defineConfig({...baseline,testDir:'./tests/pr161',testIgnore:[],
  outputDir:'./node_modules/.cache/pr161-results',
  reporter:[['list'],['json',{outputFile:'./node_modules/.cache/pr161-report/results.json'}]],
  use:{...baseline.use,trace:'on',screenshot:'on'},
});
