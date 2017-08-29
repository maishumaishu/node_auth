import * as http from 'http';
import * as express from 'express';
import * as errors from './errors';
import * as url from 'url';
import { AppRequest, Controller, UserController } from './common'
import { Token, Database } from './database';
import * as logger from './logger'
import * as settings from './settings';
import * as mongodb from 'mongodb';

const APP_KEY = 'application-key';
const APP_ID = 'application-id';
const USER_TOKEN = 'user-token';
const USER_ID = 'user-id';
const POST_DATA = 'postData';

let app = express();

interface AppInfo {
    applicationId: mongodb.ObjectID,
    applicationToken: string,
    userId: mongodb.ObjectID,
    userToken: string,
}

app.options('/*', function (req, res) {
    setHeaders(res);
    res.send();
})

function setHeaders(res: express.Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.setHeader('Access-Control-Allow-Headers', settings.allowHeaders);
    res.setHeader('Access-Control-Allow-Methods', `POST, GET, OPTIONS, PUT, DELETE`);
}

app.use('/*', async function (req: express.Request & AppInfo, res, next) {
    try {

        logger.logUserRequest(req);
        setHeaders(res);

        let tasks = [];
        let applicationToken = req.headers[APP_KEY] || req.query[APP_KEY];
        if (applicationToken != null) {
            req.applicationToken = applicationToken;
            tasks.push(Token.parse(applicationToken));
        }
        else {
            tasks.push(Promise.resolve());
        }

        let userTokenString = req.headers[USER_TOKEN];
        if (userTokenString != null) {
            tasks.push(Token.parse(userTokenString));
        }

        Promise.all(tasks)
            .then(results => {
                let appToken = results[0] as Token;
                let userToken = results[1] as Token;
                // console.assert(appToken != null, "app Token is null.");

                if (appToken != null) {
                    req.applicationId = appToken.objectId;
                }

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

let userControllers = ['user', 'sms'];
let adminControllers = ['application', 'log', 'admin'];
let moduleNames = userControllers.concat(adminControllers);
app.use('/:controller/:action', executeAction);
function executeAction(req: AppRequest & AppInfo, res, next) {

    let actionName = req.params.action;
    let controllerName = req.params.controller;

    if (moduleNames.indexOf(controllerName) < 0) {
        next();
        return;
    }

    let controllerPath = userControllers.indexOf(controllerName) >= 0 ?
        `./userControllers/${controllerName}` :
        `./adminControllers/${controllerName}`;

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

    let action = controller[actionName] as Function; controller
    if (action == null) {
        console.log(`Action '${actionName}' is not exists in '${controllerName}'`);
        let result = errors.actionNotExists(actionName, controllerName);
        next(result);
        return;
    }

    let dataPromise: Promise<any>;
    if (req.method == 'GET') {
        dataPromise = Promise.resolve(req.query);
    }
    else {
        dataPromise = getPostObject(req);
    }

    if (req.applicationId)
        (controller as UserController).appId = req.applicationId;

    if (req.userId)
        (controller as UserController).userId = req.userId;

    dataPromise.then((data) => {
        let result: any;
        result = action.apply(controller, [data]);
        if (result instanceof Promise) {
            result.then(() => {
                disposeController(controller);
            }).catch((err: Error) => {
                disposeController(controller)
            });
        }
        else {
            disposeController(controller);
        }
        next(result);
    });

    let disposeController = function (controller: Controller) {
        if (controller.databaseInstances) {
            controller.databaseInstances.forEach(db => {
                db.close();
            })
        }
    }
}

app.use('/*', function (req: express.Request & AppInfo, res, next) {
    redirectRequest(req, res);
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
    console.assert(obj != null, 'obj can not be null.');
    response.statusCode = 200;
    response.write(JSON.stringify(obj));
    response.end();
}

function outputError(response: http.ServerResponse, err: Error) {
    console.assert(err != null, 'error is null');
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

async function redirectRequest(req: express.Request & AppInfo, res: express.Response) {
    try {
        let { host, path, port } = await getRedirectInfo(req.applicationId, req);
        //TODO:返回值为空，返回 404

        let headers: any = req.headers;
        headers.host = host;

        if (req.applicationId)
            headers[APP_ID] = req.applicationId.toHexString();

        if (req.userId)
            headers[USER_ID] = req.userId.toHexString();

        if (req.userId) {
            if (path.indexOf('?') < 0)
                path = path + '?';
            else
                path = path + '&';

            path = path + `userId=${req.userId.toHexString()}`;
        }

        let request = http.request(
            {
                host: host,
                path: path,
                method: req.method,
                headers: headers,
                port: port
            },
            (response) => {
                console.assert(response != null);
                for (var key in response.headers) {
                    res.setHeader(key, response.headers[key]);
                }
                res.statusCode = response.statusCode;
                res.statusMessage = response.statusMessage;
                res.setHeader('Access-Control-Allow-Origin', '*');
                response.pipe(res);

                console.assert(logRecordPromise != null);
                logRecordPromise.then((record) => {
                    return logger.logRedirectResponse(record._id, response);
                })
            },
        );

        let logRecordPromise = logger.logRedirectRequest(request);


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

type RediectInfo = { host: string, path: string, port: number };
async function getRedirectInfo(applicationId: mongodb.ObjectID, req: express.Request): Promise<RediectInfo> {
    // console.assert(applicationId != null, 'applicationId can not be null.');
    if (applicationId == null)
        throw errors.applicationIdRequired();

    let application = await Database.application(applicationId);
    if (!application) {
        let err = errors.objectNotExistWithId(applicationId.toHexString(), 'Application');
        return Promise.reject<any>(err);
    }

    let redirectInfos = settings.redirectInfos; //application.redirects || [];

    let u1 = url.parse(req.originalUrl);
    let arr = u1.path.split('/').filter(o => o);
    let rootDir = arr.shift();      // 获取请求路径的根目录
    let path = arr.join('/');       // 获取相对于根目录的路径

    let redirectInfo = redirectInfos.pathInfos.filter(o => o.rootDir == rootDir)[0];
    if (redirectInfo == null)
        throw errors.canntGetRedirectUrl(rootDir);

    let target = combinePaths(redirectInfo.targetUrl, path);
    let u = url.parse(target);
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


