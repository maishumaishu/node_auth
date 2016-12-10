import * as http from 'http';
import * as express from 'express';
import * as errors from '../errors';
import { AppRequest } from '../common';

let userService = express();

userService.post(['/user/:action', '/sms/:action'], executeAction);

function executeAction(req: AppRequest, res, next) {
    let pathParts = req.path.split('/').filter(o=>o.trim() != '');
    console.assert(pathParts.length >= 2);

    let applicationId = 'value.applicationId';
    console.assert(applicationId != null);

    let actionName = pathParts[pathParts.length - 1];
    let controllerPath = '../modules/' + pathParts.slice(0, pathParts.length - 1).join('/');
    let controller = require(controllerPath);
    if (controller == null) {
        let result = errors.controllerNotExist(controllerPath);
        next(result);
        return;
    }

    let action = controller[actionName];
    if (action == null) {
        let result = errors.actionNotExists(actionName, controllerPath);
        next(result);
        return;
    }

    let result = action(req.postData);
    next(result);
}

export = userService;