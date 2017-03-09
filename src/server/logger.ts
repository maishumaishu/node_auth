import * as express from 'express';
import { MongoClient } from 'mongodb';
import * as settings from './settings';

export function log(request: express.Request) {
    /** 说明：连接mongodb，简单即可，不需要按应用里的方法写． */
    let connectionString = `mongodb://${settings.monogoHost}/log`;
    MongoClient.connect(connectionString, { maxPoolSize: 50 }, (err, db) => {
        // 记住一定要关闭连接
        db.close();
    })
}