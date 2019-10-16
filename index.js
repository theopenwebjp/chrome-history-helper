const {Utility} = require('js-functions');
const Uri = require('jsuri');
const parse = require('csv-parse/lib/sync');
const $ = require('jquery');
const moment = require('moment');
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
     * @param {object} options
     * @return {Promise}
     */
    static getCsv(url, options={}){
        //Browser
        //return $.ajax(url)
        //Node
        const getUrlNode = (url)=>{
            return new Promise((resolve, reject)=>{
                /*
                request(url, (error, response, body)=>{
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    console.log('body:', body); // Print the HTML for the Google homepage.

                    if(error){
                        return reject(error);
                    }else{
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
            let csv = parse(data, {});
            if(options.removeHeaders){
                csv.splice(0, 1);
            }
            //console.log('getCsv', csv);
            
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
        try{
            uri = new Uri(url);
            domain = uri.host();
        }catch(err){
            console.error(url, err);
        }

        return domain;
    }

    /**
     * @param {*} data
     * @param {string} fileName
     */
    static download(data, fileName){

        //Node
        if(!fileName){
            fileName = getFormattedDate() + '.txt';
            //fileName = String(new Date().getTime()) + '.txt';
        }
        fs.writeFileSync('./results/' + fileName, data, {encoding: 'utf-8'});
        //Browser
        //return Utility.downloadData(data);
    }

    /**
     * @param {array} arr
     * @return {object}
     */
    static getArrayItemCounts(arr){
        console.log('getArrayItemCounts', arr);
        
        //Sort as new array so easy to get counts as groups.
        const newArr = arr.slice();
        newArr.sort();

        let curKey = null;
        const counts = {
            //
        };

        newArr.forEach((item)=>{
            curKey = item;

            //Initialize
            if(counts[curKey] === undefined){
                counts[curKey] = 0;
            }

            counts[curKey]++;
        });

        return counts;
    }

    /**
     * @param {object} counts
     * @return {object}
     */
    static groupObjectCounts(counts){
        const groups = {};
        for(let url in counts){
            let count = counts[url];

            //Initialize
            if(groups[count] === undefined){
                groups[count] = [];
            }

            groups[count].push(url);
        }

        return groups;
    }

    /**
     * @param {array} twoDimArr
     * @return {array}
     */
    static twoDimArrToUrls(twoDimArr){
        return twoDimArr.map((arr)=>{
            return arr[CSV_GET_COL];
        });
    }

    /**
     * @param {string} csvUrl
     * @return {Promise}
     */
    static downloadHistoryData(csvUrl){
        return ChromeHistoryHelper.getCsv(csvUrl, {removeHeaders: true})
        .then(getDownloadHandler('history-data'));
    }

    /**
     * @param {string} csvUrl
     * @return {Promise}
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
 * @return {function}
 */
function getDownloadHandler(name, format='.txt'){
    const date = getFormattedDate();
    const fileName = `${name}-${date}${format}`;

    return (data)=>{
        ChromeHistoryHelper.download(data, fileName);
    };
}

/**
 * @return {*}
 */
function getFormattedDate(){
    return moment().format('YYYY-MM-DD-hh-mm-ss');
}

if(typeof window === 'object'){
    window.ChromeHistoryHelper = ChromeHistoryHelper;
}
if(typeof module === 'object'){
    module.exports = ChromeHistoryHelper;
}