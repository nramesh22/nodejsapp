const config = require('../config.json');
const _ = require('lodash');

Parse.Cloud.job('findDuplicate', async (request, status) =>  {
    const inputKeys = request.params.keys || [];
    Parse.serverURL = 'http://localhost:3000/api/v1';
    Parse.initialize(config.appId);
    const printable = Parse.Object.extend('printable');

    const allData = await new Parse.Query(printable)
        .limit(9999999)
        .find();

    const allResult = [];

    const array = allData.map(e => ({ ..._.pick(e.toJSON(), inputKeys), id: e.id }));

    let index = 0;

    console.log(array[0]);

    console.log(array.filter(res => res.id.charCodeAt(0) > 48 && res.id.charCodeAt(0) < 57));

    for (const e of array.filter(res => res.id.charCodeAt(0) > 48 && res.id.charCodeAt(0) < 57)) {
        const matchedRecords = [];
        await (Array.from(array).splice(index)).map(async (otherOne, arrayIndex) => {
            if (arrayIndex !== index) {
                const match = [];
                inputKeys.forEach(key => {
                    // WORKS ONLY WITH ARRAY
                    let found;
                    if (Array.isArray(otherOne[key])) {
                        found = otherOne[key].some(tx => Array.isArray(e[key]) ? e[key].indexOf(tx) >= 0 : e[key] === tx);
                    } else if (typeof otherOne[key] === 'string') {
                        found = otherOne[key] === e[key];
                    }
                    if (found) {
                        match.push(key);
                    }
                });
                if (match.length !== 0) {
                    matchedRecords.push({ match, remoteRecord: otherOne.id, currentRecord: e.id });
                }
            }
        });
        allResult.push(matchedRecords);
        console.log(`Done with ${ index }`);
        index++;
    }

    const jobResult = Parse.Object.extend('jobResult');

    allResult.forEach(e => {
        const data = new jobResult();
        data.set('result', e);
        data.set('jobId', request.jobId);
        data.save();
    });
    status.success(allResult);
});
