const gulp = require('gulp');
const ChromeHistoryHelper = require('./index.js');
const CSV_URL = './results/my-history.csv';
const path = require('path');
let url = path.resolve(CSV_URL);
console.log(url, CSV_URL, path.resolve(CSV_URL));

gulp.task('history', function(){
    ChromeHistoryHelper.downloadHistoryData(url);
});

gulp.task('domain-views', function(){
    ChromeHistoryHelper.downloadDomainsByViews(url);
});