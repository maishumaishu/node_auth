import * as http from 'http';
import * as express from 'express';
import * as errors from '../errors';
import * as  controller from '../modules/application';
import { AppRequest } from '../common';

let app = express();

app.all('/application/list', async function (req, res, next) {
    let result = controller.list();
    next(result);
});

app.post('/application/save', async function (req: AppRequest, res, next) {
    let postData = req.postData; //await getPostObject(req);
    let result = controller.save(<any>postData);
    next(result);
});

export = app;