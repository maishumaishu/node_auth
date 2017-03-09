import * as http from 'http';
import * as express from 'express';
import * as controller from './modules/application';
import * as errors from './errors';
import * as mongodb from 'mongodb';
import * as url from 'url';
import { AppRequest, Controller } from './common'
import { Token, SystemDatabase } from './database';
import * as logger from './logger' 


const HEADER_APP_TOKEN = 'application-token';
const HEADER_APP_ID = 'application-id';
const HEADER_USER_TOKEN = 'user-token';
const HEADER_USER_ID = 'user-id';
const POST_DATA = 'postData';

let app = express();

interface AppInfo {
    applicationId: string,
    applicationToken: string,
    userId: string,
    userToken: string,
}

app.options('/*', function (req, res) {
    setHeaders(res);
    res.send();
})

function setHeaders(res: express.Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.setHeader('Access-Control-Allow-Headers', `${HEADER_APP_TOKEN},${HEADER_USER_TOKEN}, content-type`);
    res.setHeader('Access-Control-Allow-Methods', `POST, GET, OPTIONS, PUT, DELETE`);
}

app.use('/*', async function (req: express.Request & AppInfo, res, next) {
    try {
        
        logger.log(req);
        setHeaders(res);

        let applicationToken = req.headers[HEADER_APP_TOKEN] || req.query[HEADER_APP_TOKEN];
        if (!applicationToken) {
            let err = errors.canntGetHeader(HEADER_APP_TOKEN);
            throw err;
        }

        req.applicationToken = applicationToken;
        let tasks = [Token.parse(applicationToken)];
        let userTokenString = req.headers[HEADER_USER_TOKEN];
        if (userTokenString != null) {
            tasks.push(Token.parse(userTokenString));
        }

        Promise.all(tasks)
            .then(results => {
                let appToken = results[0] as Token;
                let userToken = results[1] as Token;
                console.assert(appToken != null);

                req.applicationId = appToken.objectId;
                if (userToken != null) {
                    req.userId = userToken.objectId;
                }

                next();
            })
            .catch(err => {
                next(err);
            });

    }
    catch (err) {
        next(err);
    }
});

let moduleNames = ['user', 'sms', 'application'];
app.use('/:controller/:action', executeAction);
function executeAction(req: AppRequest & AppInfo, res, next) {

    let actionName = req.params.action;
    let controllerName = req.params.controller;

    if (moduleNames.indexOf(controllerName) < 0) {
        next();
        return;
    }

    let controllerPath = `./modules/${controllerName}`;
    let controllerModule = require(controllerPath);
    if (controllerModule == null) {
        let result = errors.controllerNotExist(controllerPath);
        next(result);
        return;
    }

    let controllerClass = controllerModule.default;
    if (controllerClass == null) {
        let result = errors.controllerNotExist(controllerPath);
        next(result);
        return;
    }

    let controller = new controllerClass() as Controller;

    let action = controller[actionName] as Function;
    if (action == null) {
        console.log(`Action '${actionName}' is not exists in '${controllerName}'`);
        next();
        return;
    }

    let dataPromise: Promise<any>;
    if (req.method == 'GET') {
        dataPromise = Promise.resolve(req.query);
    }
    else {
        dataPromise = getPostObject(req);
    }

    controller.appId = req.applicationId;
    controller.userId = req.userId;

    dataPromise.then((data) => {
        let result = action.apply(controller, [data]);
        next(result);
    });
}

app.use('/*', function (req: express.Request & AppInfo, res, next) {
    request(req, res);
});

app.use('/*', async function (value, req, res, next) {
    if (value instanceof Promise) {
        value
            .then((obj) => {
                outputToResponse(res, obj)
            })
            .catch((err) => {
                outputError(res, err)
            });
    }
    else if (value instanceof Error) {
        outputError(res, value);
        res.end();
    }
    else {
        outputToResponse(res, value);
        res.end();
    }

} as express.ErrorRequestHandler);


async function parseUserToken(appId: string, userToken: string) {
    let token = await Token.parse(userToken);
    return token.objectId;
}


function outputToResponse(response: http.ServerResponse, obj: any) {
    console.assert(obj != null);
    response.statusCode = 200;
    response.write(JSON.stringify(obj));
    response.end();
}

function outputError(response: http.ServerResponse, err: Error) {
    console.assert(err != null);
    response.statusCode = 200;
    let outputObject = { message: err.message, name: err.name, stack: err.stack };
    response.write(JSON.stringify(outputObject));
    response.end();
}

import querystring = require('querystring');
function getPostObject(request: http.IncomingMessage & Express.Request): Promise<any> {
    let method = (request.method || '').toLowerCase();
    let length = request.headers['content-length'] || 0;
    let contentType = request.headers['content-type'] as string;
    if (length <= 0)
        return Promise.resolve({});

    return new Promise((reslove, reject) => {
        request.on('data', (data: { toString: () => string }) => {
            let text = data.toString();
            try {
                let obj;
                if (contentType.indexOf('application/json') >= 0) {
                    obj = JSON.parse(text)
                }
                else {
                    obj = querystring.parse(text);
                }

                reslove(obj);
            }
            catch (exc) {
                let err = errors.postDataNotJSON(text);
                console.assert(err != null);
                reject(err);
            }
        });
    });
}

async function request(req: express.Request & AppInfo, res: express.Response) {
    try {
        let { host, path, port } = await getRedirectInfo(req.applicationId);

        let headers: any = req.headers;
        headers.host = host;

        if (req.applicationId)
            headers[HEADER_APP_ID] = req.applicationId;

        if (req.userId)
            headers[HEADER_USER_ID] = req.userId;

        let requestUrl = combinePaths(path, req.originalUrl);
        if (req.userId) {
            requestUrl = requestUrl + `&userId=${req.userId}`;
        }

        let request = http.request(
            {
                host: host,
                path: requestUrl,
                method: req.method,
                headers: headers,
                port: port,
            },
            (response) => {
                console.assert(response != null);
                for (var key in response.headers) {
                    res.setHeader(key, response.headers[key]);
                }
                res.statusCode = response.statusCode;
                res.statusMessage = response.statusMessage;
                res.setHeader('Access-Control-Allow-Origin', '*');
                // res.setHeader('Access-Control-Allow-Headers', this.allowHeaders);
                response.pipe(res);
            },
        );

        request.on('error', function (err) {
            outputError(res, err);
        })

        let contentLength = 0;
        if (req.headers['content-length']) {
            contentLength = new Number(req.headers['content-length']).valueOf();
        }

        req.on('data', (data) => {
            request.write(data);
        })
        req.on('end', (data) => {
            request.end();
        })
    }
    catch (err) {
        outputError(res, err);
    }
}

async function getRedirectInfo(applicationId: string): Promise<{ host: string, path: string, port: number }> {
    let db = await SystemDatabase.createInstance();
    let application = await db.applications.findOne({ _id: new mongodb.ObjectID(applicationId) });
    db.close();

    if (!application) {
        let err = errors.objectNotExistWithId(applicationId, 'Application');
        return Promise.reject<any>(err);
    }

    let u = url.parse(application.targetUrl);
    // u.hostname = '115.29.169.7'
    //u.hostname = '115.29.169.7'; //01f2023c-4f87-4964-83fe-8d3f4585deb0 01f2023c-4f87-4964-83fe-8d3f4585deb0
    //+		dc.ApplicationId	{7bbfa36c-8115-47ad-8d47-9e52b58e7efd}	System.Guid
    //+		dc.ApplicationId	{747227bc-f935-4fce-9462-9df4f89c40fc}	System.Guid
    return { host: u.hostname, path: u.path, port: new Number(u.port).valueOf() };
}

function combinePaths(path1: string, path2: string) {
    console.assert(path1 != null && path2 != null);
    if (!path1.endsWith('/')) {
        path1 = path1 + '/';
    }

    if (path2[0] == '/') {
        path2 = path2.substr(1);
    }

    return path1 + path2;
}

app.listen(2800);


