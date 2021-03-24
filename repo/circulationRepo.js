const { MongoClient, ObjectID } = require('mongodb');

function circulationRepo() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'circulation';

    function remove(id){
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const removed = await db.collection('newspapers').deleteOne({_id: ObjectID(id)});
                resolve(removed.deletedCount === 1);
                client.close();
            } catch (error) {
                reject(error);
            }
        })
    }

    function update(id, newItem){
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const updatedItem = await db.collection('newspapers').findOneAndReplace({_id: ObjectID(id)}, newItem, {returnOriginal:false});
                resolve(updatedItem.value);
                client.close();
            } catch (error) {
                reject(error);                
            }
        })
    }

    function get(query, limit){
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try{
                await client.connect();
                const db = client.db(dbName);
                
                let items = db.collection('newspapers').find(query);

                if (limit > 0){
                    items = items.limit(limit);
                }
                resolve(await items.toArray());
                client.close();
            }
            catch(error){
             reject(error);   
            }
        })
    }

    function add(item){
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const addeditem = await db.collection('newspapers').insertOne(item);
                resolve(addeditem.ops[0]);
                client.close();                
            } catch (error) {
                reject(error);
            }
        })
    }

    function getbyId(id){
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try{
                await client.connect();
                const db = client.db(dbName);
                
                const item = await db.collection('newspapers').findOne({_id: ObjectID(id)});

                resolve(item);
                client.close();
            }
            catch(error){
             reject(error);   
            }
        })
    }

    function loadData(data) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try{
                await client.connect();
                const db = client.db(dbName);

                result = await db.collection('newspapers').insertMany(data);
                resolve(result);
                client.close();             // to close connection
            }
            catch(error){
                reject(error);
            }
        })
    }

    function averageFinalists(){
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try{
                await client.connect();
                const db = client.db(dbName);

                const average = await db.collection('newspapers').aggregate(
                    [{ $group: {
                        _id: null,
                        avgFinalists: {$avg: "$Pulitzer Prize Winners and Finalists, 1990-2014"}
                    }}]).toArray();

                resolve(average[0].avgFinalists);
                client.close();             
            }
            catch(error){
                reject(error);
            }
        })
    }

    return { loadData, get, getbyId, add, update, remove, averageFinalists }

}

module.exports = circulationRepo();           // to return the circulationRepo 