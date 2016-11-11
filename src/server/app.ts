

import * as settings from './settings';
import { BaseController } from './controllers/baseController';

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
