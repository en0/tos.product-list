'use strict';

const LOCALCACHE = require('./3.json');
const co = require('co');
const lodash = require('lodash');
const http = require('got');
const ROOT_URL = "https://www.youngliving.com"
const fs = require('fs');
const jsonic = require('jsonic');
const CSV = require('fast-csv');
const argparse = require('argparse');

const main = co.wrap(_main);
const getProductCatalog = co.wrap(_getProductCatalog);
const getProductUrl = co.wrap(_getProductUrl);

const ap = argparse.ArgumentParser();
ap.addArgument([ 'CULTURECODE' ], {
    type: String,
    choices: [ 'en-US', 'en-GB', 'en-AU', 'en-CA' ]
});
ap.addArgument([ '-t', '--type' ], {
    type: Number,
    defaultValue: 3
});
ap.addArgument([ '-o', '--output' ], {
    type: String,
    defaultValue: 'output.csv'
});
const opts = ap.parseArgs();
const cultureCode = opts.CULTURECODE;
const customerType = opts.type.toString();
const outputFile = opts.output

main()
    .then(v=>console.log(v||`DONE ${cultureCode}`))
    .catch(e=>console.error(e.stack));

function *_main() {


    var csvStream = CSV.createWriteStream({headers: true});
    var writableStream = fs.createWriteStream(outputFile);

    var url = yield getProductUrl(cultureCode, customerType);
    var catalog = yield getProductCatalog(url);

    csvStream.pipe(writableStream);
    for(var item of catalog.items) {

        var rf = lodash.get(item, 'currency.roundFactor');
        var wp = lodash.get(item, 'wholesaleDisplayPrice', '0').toString();
        var rp = lodash.get(item, 'retailDisplayPrice', '0').toString();

        var r = lodash.pick(item, [
            'name',
            'canPurchaseWithER',
            'canPurchase',
            'pointValue',
            'partNumber',
            'inStock',
            'isNFR',
        ]);

        r.currency = lodash.get(item, 'currency.code');
        r.wholesaleDisplayPrice = normalizePrice(wp, rf);
        r.retailDisplayPrice = normalizePrice(rp, rf);
        r.cultureCode = cultureCode;

        csvStream.write(r);
    }

    csvStream.end();

    //console.log(catalog.items[933]); // sample oil (pepermint)
}

function *_getProductUrl(cltr, type) {

    var ctry=cltr.split('-').pop();
    return `${ROOT_URL}/api/shopping/product-catalog/${cltr}/${ctry}/${type}`;

}

function *_getProductCatalog(url) {

    //return LOCALCACHE;

    var response = yield http.get(url);
    return JSON.parse(response.body);

}

function normalizePrice(value, roundFactor) {

    if(!roundFactor || roundFactor < 1)
        return value;
    else if(!value)
        return value;
    else if(!value.length)
        return value;
    else if(value.length <= 1)
        return value;

    var r = value.length - roundFactor;
    return value.substr(0, r) + "." + value.substr(r);
}
