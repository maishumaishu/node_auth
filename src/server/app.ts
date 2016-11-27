
//==============================================================
// 说明：启动反向代理服务器
import { SystemDatabase } from './database';
import { ProxyServer } from './proxyServer';
SystemDatabase.createInstance().then(async (sys_db) => {
  let proxyServer = new ProxyServer({ port: 2014 });
  proxyServer.start();
});
//==============================================================

import * as http from 'http';
import * as express from 'express';
import * as  controller from './modules/application';
import * as errors from './errors';


const APPLICATION_ID = 'application-id';
const APPLICATION_TOKEN = 'application-token';
const USER_ID = 'user-id';
const USER_TOKEN = 'user-token';

let app = express();

app.use('/*', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  let applicationId = req.headers[APPLICATION_ID];

  next();
});

import userService = require('./services/user');
import platformService = require('./services/platform');

app.use('/', platformService);
app.use('userService', userService);

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

app.listen(3010);
