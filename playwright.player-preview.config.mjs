import {defineConfig} from '@playwright/test';
import baseline from './playwright.config.mjs';
export default defineConfig({...baseline,testDir:'./tests/phieng-loi-preview',testIgnore:[],maxFailures:0,
 outputDir:'node_modules/.cache/task06-results',
 reporter:[['list'],['json',{outputFile:'node_modules/.cache/task06-report/results.json'}],['html',{outputFolder:'node_modules/.cache/task06-report/html',open:'never'}]],
 use:{...baseline.use,baseURL:process.env.TASK06_URL||'http://localhost:4176',trace:'on',video:'on',screenshot:'on'},
 webServer:process.env.TASK06_URL?[]:[{command:'npm run build:player-preview && npx vite preview --outDir dist-player-preview --host 127.0.0.1 --port 4176 --strictPort',env:{VITE_SUPABASE_URL:'https://pl00.invalid',VITE_SUPABASE_ANON_KEY:'pl00-public-test-key'},url:'http://localhost:4176',reuseExistingServer:false,timeout:90000}],
});
