const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const circulationRepo = require('./repo/circulationRepo.js');
const data = require('./circulation.json');

const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main(){
    const client = new MongoClient(url);
    await client.connect();

    try{
        const results = await circulationRepo.loadData(data);
    assert.equal(data.length, results.insertedCount);

    const getData = await circulationRepo.get();
    assert.equal(data.length, getData.length);

    const filterData = await circulationRepo.get({Newspaper: getData[4].Newspaper});
//    assert.equal(filterData[0], getData[4]);
    assert.deepEqual(filterData[0], getData[4]);

    const limitData = await circulationRepo.get({}, 3);
    assert.equal(limitData.length, 3);

    const id = getData[4]._id.toString();
    const byId = await circulationRepo.getbyId(id);
    assert.deepEqual(byId, getData[4]);

    const newItem = {
        "Newspaper": "My Paper",
        "Daily Circulation, 2004": 1,
        "Daily Circulation, 2013": 2,
        "Change in Daily Circulation, 2004-2013": 100,
        "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
        "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
        "Pulitzer Prize Winners and Finalists, 1990-2014": 0
    }
    const addedItem = await circulationRepo.add(newItem);
    assert(addedItem._id);

    const addedItemQuery = await circulationRepo.getbyId(addedItem._id);
    assert.deepEqual(addedItemQuery, newItem);

    const updatedItem = await circulationRepo.update(addedItem._id, {
        "Newspaper": "My new updated Paper",
        "Daily Circulation, 2004": 1,
        "Daily Circulation, 2013": 2,
        "Change in Daily Circulation, 2004-2013": 100,
        "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
        "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
        "Pulitzer Prize Winners and Finalists, 1990-2014": 0
    });
    assert.equal(updatedItem.Newspaper, "My new updated Paper");

    const newaddedItemQuery = await circulationRepo.getbyId(addedItem._id);
    assert.equal(newaddedItemQuery.Newspaper, "My new updated Paper");

    const removed = await circulationRepo.remove(addedItem._id);
    assert(removed);

    const deletedItem = await circulationRepo.getbyId(addedItem._id);
    //console.log(deletedItem);
    assert.equal(deletedItem, null);

    const avgFinalists = await circulationRepo.averageFinalists();
    console.log("Averages Finalist: "+ avgFinalists);

    }
    catch(error){
        console.log(error);
    }
    finally{
        //    console.log(results.insertedCount, results.ops);
        const admin = client.db(dbName).admin();
        //    console.log(await admin.serverStatus());

        await client.db(dbName).dropDatabase();
        console.log(await admin.listDatabases());
        client.close();
    }
}

main();
