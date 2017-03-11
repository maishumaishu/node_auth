import * as express from 'express';
import { MongoClient, ObjectID } from 'mongodb';
import * as settings from './settings';
import { DataContext, tableNames } from './database';
import * as http from 'http';

export function logUserRequest(request: express.Request) {
    return DataContext.execute(settings.conn.log, tableNames.RequestLog, function (table) {
        let { baseUrl, headers, host, originalUrl, ip, path, query } = request;
        return table.insertOne({ baseUrl, headers, host, originalUrl, ip, path, query });
    });
}

export function logRedirectRequest(request: http.ClientRequest) {
    return DataContext.execute(settings.conn.log, tableNames.RedirectLog, function (table) {
        let req = request as any;
        let { _headers, path, method } = req;
        request.on('data', function () {
            debugger;
        });
        request.on('end', function () {
            debugger;
        });
        return table.insertOne({ request: { headers: _headers, method, path } });
    });
}

export function logRedirectResponse(_id: ObjectID, response: http.IncomingMessage) {
    return DataContext.execute(settings.conn.log, tableNames.RedirectLog, function (table) {
        let { headers, statusCode, statusMessage } = response;
        return table.updateOne({ _id }, { $set: { response: { headers, statusCode, statusMessage } } });
    })
}