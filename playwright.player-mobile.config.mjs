import {defineConfig} from '@playwright/test';
import preview from './playwright.player-preview.config.mjs';
export default defineConfig({...preview,testDir:'./tests/phieng-loi-mobile',retries:0,workers:1,maxFailures:0,
 outputDir:'node_modules/.cache/task06-mobile-results',
 reporter:[['list'],['json',{outputFile:'node_modules/.cache/task06-mobile-report/results.json'}]],
 projects:[
  {name:'webkit-667-landscape',use:{browserName:'webkit',viewport:{width:667,height:375},hasTouch:true,isMobile:true,launchOptions:{}}},
  {name:'webkit-844-landscape',use:{browserName:'webkit',viewport:{width:844,height:390},hasTouch:true,isMobile:true,launchOptions:{}}},
  {name:'webkit-ipad',use:{browserName:'webkit',viewport:{width:1024,height:768},hasTouch:true,isMobile:true,launchOptions:{}}},
  {name:'chromium-android-landscape',use:{browserName:'chromium',viewport:{width:915,height:412},hasTouch:true,isMobile:true}},
 ],
});
