import * as express from 'express';
import { MongoClient, ObjectID } from 'mongodb';
import * as settings from './settings';
import { DataContext } from './database';
import * as http from 'http';

export function logUserRequest(request: express.Request) {
    return DataContext.execute(settings.conn.log, "RequestLog", function (table) {
        let { baseUrl, headers, host, originalUrl, ip, path, query } = request;
        return table.insertOne({ baseUrl, headers, host, originalUrl, ip, path, query });
    });
}

export function logRedirectRequest(request: express.Request) {
    return DataContext.execute(settings.conn.log, "RedirectLog", function (table) {
        let { baseUrl, headers, host, originalUrl, query } = request;
        return table.insertOne({ request: { baseUrl, headers, host, originalUrl, query } });
    });
}

export function logRedirectResponse(_id: ObjectID, response: http.IncomingMessage) {
    return DataContext.execute(settings.conn.log, 'RedirectLog', function (table) {
        let { headers, statusCode, statusMessage } = response;
        table.source.findOneAndUpdate({ _id }, { $set: { response: { headers, statusCode, statusMessage } } });
        return Promise.resolve();
    })
}