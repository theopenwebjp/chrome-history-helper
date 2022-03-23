const { Utility } = require('js-functions');
const Uri = require('jsuri');
const { parse } = require('csv-parse/sync');
const $ = require('jquery');
// const moment = require('moment'); // Remove if date-fns is working.
// const { format } = moment();
const format = require('date-fns/format');
// console.log({ format })
/*
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
$.support.cors = true;
$.ajaxSettings.xhr = function(){
    return new XMLHttpRequest();
}
*/
const request = require('request');
const fs = require('fs');

const CSV_GET_COL = 1;

class ChromeHistoryHelper{

    /**
     * @param {string} url
     * @param {{ removeHeaders?: boolean }} [options]
     */
    static getCsv(url, options = {}){
        // Browser
        // return $.ajax(url)
        // Node
        /**
         * @param {string} url
         */
        const getUrlNode = (url)=>{
            return new Promise((resolve, reject) => {
                /*
                request(url, (error, response, body) => {
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    console.log('body:', body); // Print the HTML for the Google homepage.

                    if (error) {
                        return reject(error);
                    } else {
                        return resolve(body);
                    }
                });
                */

                const str = fs.readFileSync(url, {encoding: 'utf-8'});
                resolve(str);
            });
        }
        return getUrlNode(url)
        .then((data)=>{
            /**
             * @type {any}
             */
            let csv = parse(data, {});
            if(options.removeHeaders){
                csv.splice(0, 1);
            }
            // console.log('getCsv', csv);
            
            return csv;
        });
    }

    /**
     * @param {string} url
     * @return {string}
     */
    static urlToDomain(url){
        let uri;
        let domain = '';
        try {
            uri = new Uri(url);
            domain = uri.host();
        } catch(err) {
            console.error(url, err);
        }

        return domain;
    }

    /**
     * @param {*} data
     * @param {string} fileName
     */
    static download(data, fileName){
        if (data && typeof data === 'object') {
            data = JSON.stringify(data)
        }

        // Node
        if (!fileName) {
            fileName = getFormattedDate() + '.txt';
            // fileName = String(new Date().getTime()) + '.txt';
        }
        fs.writeFileSync('./results/' + fileName, data, {encoding: 'utf-8'});
        // Browser
        // return Utility.downloadData(data);
    }

    /**
     * @param {any[]} arr
     */
    static getArrayItemCounts(arr) {
        // console.log('getArrayItemCounts', arr);
        
        // Sort as new array so easy to get counts as groups.
        const newArr = arr.slice();
        newArr.sort();

        /**
         * @type {string|null}
         */
        let curKey = null;
        /**
         * @type {Record<string, number>}
         */
        const counts = {
            //
        };

        newArr.forEach((item) => {
            curKey = item;
            if (!curKey) {
                return
            }

            // Initialize
            if (counts[curKey] === undefined) {
                counts[curKey] = 0;
            }

            counts[curKey]++;
        });

        return counts;
    }

    /**
     * @param {Record<string, number>} counts
     */
    static groupObjectCounts(counts){
        /**
         * @type {Record<string, string[]>}
         */
        const groups = {};
        for (let url in counts) {
            let count = String(counts[url]);

            //Initialize
            if (groups[count] === undefined) {
                groups[count] = [];
            }

            groups[count].push(url);
        }

        return groups;
    }

    /**
     * @param {any[][]} twoDimArr
     */
    static twoDimArrToUrls(twoDimArr){
        return twoDimArr.map((arr)=>{
            return arr[CSV_GET_COL];
        });
    }

    /**
     * @param {string} csvUrl
     */
    static downloadHistoryData(csvUrl){
        return ChromeHistoryHelper.getCsv(csvUrl, {removeHeaders: true})
        .then(getDownloadHandler('history-data'));
    }

    /**
     * @param {string} csvUrl
     */
    static downloadDomainsByViews(csvUrl){
        return ChromeHistoryHelper.getCsv(csvUrl, {removeHeaders: true})
        .then(ChromeHistoryHelper.twoDimArrToUrls)
        .then((urls)=>{
            //console.log('twoDimArrToUrls results', urls);
            return urls.map((url)=>{
                return ChromeHistoryHelper.urlToDomain(url);
            });
        })
        .then(ChromeHistoryHelper.getArrayItemCounts)
        .then(ChromeHistoryHelper.groupObjectCounts)
        .then((counts)=>{
            return JSON.stringify(counts);
        })
        .then(getDownloadHandler('domain-views', '.json'));
    }
}

/**
 * @param {string} name
 * @param {string} format
 */
function getDownloadHandler(name, format='.txt') {
    const date = getFormattedDate();
    const fileName = `${name}-${date}${format}`;

    /**
     * @param {any} data
     */
    return (data)=>{
        // console.log({ data })
        ChromeHistoryHelper.download(data, fileName);
    };
}

function getFormattedDate() {
    // return format('YYYY-MM-DD-hh-mm-ss'); // moment
    // @ts-ignore
    return format(new Date(), 'yyyy-MM-dd-hh-mm-ss'); // date-fns
}

if (typeof module === 'object') {
    module.exports = ChromeHistoryHelper;
}
