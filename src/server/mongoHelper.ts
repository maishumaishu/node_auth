import { MongoClient } from 'mongodb';
export function connect(uri: string, options: string) {
    return new Promise((reslove, reject) => {
        MongoClient.connect(uri, options, (err, db) => {
            if (err)
                reject(err);
            else
                reslove(db);
        });
    })
}