const gulp = require('gulp');
const ChromeHistoryHelper = require('./index.js');
const CSV_URL = './results/my-history.csv';
const path = require('path');
let url = path.resolve(CSV_URL);
console.log(url, CSV_URL, path.resolve(CSV_URL));

gulp.task('history', async function(){
    await ChromeHistoryHelper.downloadHistoryData(url);
});

/**
 * Sometimes URLs use a bad format that cause an error.
 * Those errors are ignored, and not added to the final output.
 */
gulp.task('domain-views', async function(){
    await ChromeHistoryHelper.downloadDomainsByViews(url);
});
