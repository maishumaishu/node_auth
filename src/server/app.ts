
// //==============================================================
// // 说明：启动反向代理服务器
// import { SystemDatabase } from './database';
// import { ProxyServer } from './proxyServer';
// // SystemDatabase.createInstance().then(async (sys_db) => {
// let proxyServer = new ProxyServer({ port: 2014 });
// proxyServer.start();
// // });
// //==============================================================

import * as http from 'http';
import * as express from 'express';
import * as controller from './modules/application';
import * as errors from './errors';
import * as mongodb from 'mongodb';
import * as url from 'url';
import { AppRequest, Controller } from './common'
import { Token, SystemDatabase } from './database';



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
}

app.use('/*', async function (req: express.Request & AppInfo, res, next) {
    try {
        setHeaders(res);

        let applicationToken = req.headers[HEADER_APP_TOKEN];
        if (!applicationToken) {
            let err = errors.canntGetHeader(HEADER_APP_TOKEN);
            throw err;
        }

        req.applicationToken = applicationToken;
        //TODO CHECK appToken
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

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json 
app.use(bodyParser.json({ type: 'application/json' }))

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

    let data;

    if (req.method == 'GET') {
        data = req.query;
    }
    else {
        data = req.body;
    }

    controller.appId = req.applicationId;
    controller.userId = req.userId;
    //.config = { appId: req.applicationId, userId: req.userId };

    let result = action.apply(controller, [data]);
    next(result);
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

function getPostObject(request: http.IncomingMessage & Express.Request): Promise<any> {
    let method = (request.method || '').toLowerCase();
    let length = request.headers['content-length'] || 0;
    if (length <= 0)
        return Promise.resolve({});

    return new Promise((reslove, reject) => {
        request.on('data', (data: { toString: () => string }) => {
            let text = data.toString();
            try {
                let obj;
                obj = JSON.parse(text)
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
        // let { applicationId } = await this.attachHeaderInfo(req);
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

        if (contentLength > 0) {
            req.on('data', (data) => {
                request.write(data);
                request.end();
            })
        }
        else {
            request.end();
        }
    }
    catch (err) {
        outputError(res, err);
    }
}

async function getRedirectInfo(applicationId: string): Promise<{ host: string, path: string, port: number }> {
    let db = await SystemDatabase.createInstance();
    let application = await db.applications.findOne({ _id: new mongodb.ObjectID(applicationId) });
    if (!application) {
        let err = errors.objectNotExistWithId(applicationId, 'Application');
        return Promise.reject<any>(err);
    }

    let u = url.parse(application.targetUrl);
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

