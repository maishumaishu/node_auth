
//==============================================================
// 说明：启动反向代理服务器
import { SystemDatabase } from './database';
import { ProxyServer } from './proxyServer';
// SystemDatabase.createInstance().then(async (sys_db) => {
let proxyServer = new ProxyServer({ port: 2014 });
proxyServer.start();
// });
//==============================================================

import * as http from 'http';
import * as express from 'express';
import * as controller from './modules/application';
import * as errors from './errors';
import { AppRequest } from './common'
import { Token } from './database';

const USER_ID = 'user-id';
const USER_TOKEN = 'user-token';
const POST_DATA = 'postData';

let app = express();

app.use('/*', function (req: AppRequest, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  let contentLenght = req.headers['content-length'] || 0;

  let p: Promise<any>;
  if (contentLenght <= 0) {
    p = Promise.resolve({});
  }
  else {
    p = getPostObject(req);
  }

  p.then(async (data) => {
    req.postData = Object.assign({}, req.query, data);

    if (!req.postData.appId)
      throw errors.applicationIdRequired();

    if (!req.postData.appToken)
      throw errors.applicationTokenRequired();

    if (req.postData.userToken) {
      req.postData.userId = await parseUserToken(req.postData.appId, req.postData.userToken);
    }

    next();

  }).catch((data) => {
    next(data);
  });

});

import userServices = require('./services/user');
import adminServices = require('./services/admin');

app.use('/adminServices', adminServices);
app.use('/userServices', userServices);

app.use('/*', async function (value, req, res, next) {
  if (value instanceof Promise) {
    value
      .then((obj) => outputToResponse(res, obj))
      .catch((err) => outputError(res, err));
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
  let token = await Token.parse(appId, userToken);
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

function getPostObject(request: http.IncomingMessage): Promise<any> {
  let method = (request.method || '').toLowerCase();
  let length = request.headers['content-length'] || 0;
  if (length <= 0)
    return Promise.resolve({});

  return new Promise((reslove, reject) => {
    request.on('data', (data: { toString: () => string }) => {
      try {
        let obj;
        obj = JSON.parse(data.toString())
        reslove(obj);
      }
      catch (exc) {
        reject(exc);
      }
    });
  });
}


app.listen(3010);
