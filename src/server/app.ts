

import * as settings from './settings';
import { BaseController } from './controllers/baseController';
import * as Errors from './errors';

//==============================================================
// 说明：启动反向代理服务器
import { SystemDatabase } from './database';
import { ProxyServer } from './proxyServer';
SystemDatabase.createInstance().then(async (sys_db) => {
  let apps = await sys_db.applications.find(null);
  for (let app of apps) {
    let u = url.parse(app.targetUrl);
    let proxyServer = new ProxyServer({ port: app.port, targetHost: u.host, baseUrl: u.path });
    proxyServer.start();
  }
});
//==============================================================

import * as http from 'http';
import * as querystring from 'querystring';
import * as url from 'url';
import * as mvc from './core/mvc';

const hostname = 'localhost';
const port = 3000;
const controllersPath = '../controllers';


class MyApplication extends mvc.Application {
  protected createController(Controller) {
    let controller = super.createController(Controller) as BaseController;
    controller.applicationId = '4C22F420-475F-4085-AA2F-BE5269DE6043';
    return controller;
  }
  protected outputToResponse(obj: any, response: http.ServerResponse) {
    obj = new MyObjectTraver(obj).execute();
    super.outputToResponse(obj, response);
  }
}

let app = new MyApplication({ port, hostname, controllersPath });
app.start();


class MyObjectTraver extends mvc.ObjectTraver {
  protected visitObject(obj) {
    //==============================================================
    // 说明：将 _id 改为 id
    let keys = Object.keys(obj).concat(Object.getOwnPropertyNames(obj));
    let result = {};
    for (let i = 0; i < keys.length; i++) {

      let key = keys[i];
      if (key == '_id') {
        let fieldValue = obj['_id'];
        if (fieldValue != null && fieldValue.toString != null) {
          fieldValue = fieldValue.toString();
        }
        result['id'] = fieldValue;
        continue;
      }

      let fieldValue = this.visitField(obj, key);
      result[key] = fieldValue;
    }
    //==============================================================
    return result;
  }
}


//==============================================================
import * as express from 'express';
import { ApplicationController } from './modules/application';
(function () {

  let app = express();

  app.get('/', function (req, res) {
    res.send('hello world');
  });

  app.post('/application/list', async function (req, res) {
    let controller = new ApplicationController();
    let applications = await controller.list();
    let str = JSON.stringify(applications);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.send(str);
  });

  app.post('/application/save', async function (req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json;charset=utf-8');

    try {
      let controller = new ApplicationController();
      let postData = await getPostObject(req);
      let result = await controller.save(postData);
      res.send(JSON.stringify(result));
    }
    catch (exc) {
      res.send(JSON.stringify(exc));
    }

  });

  app.options('/*', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.send(JSON.stringify({}));
  });

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

})();