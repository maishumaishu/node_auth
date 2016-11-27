import * as http from 'http';
import * as express from 'express';
import * as errors from '../errors';

let userService = express();
userService.all(['/user/:action', '/sms/:action'], function (value, req, res, next) {
    let pathParts = req.path.split('/');
    console.assert(pathParts.length >= 2);

    let applicationId = value.applicationId;
    console.assert(applicationId != null);

    let actionName = pathParts[pathParts.length - 1];
    let controllerPath = 'modules/' + pathParts.slice(0, pathParts.length - 1).join('/');
    let controller = require(controllerPath);
    if (controller == null) {
        let result = errors.controllerNotExist(controllerPath);
        next(result);
        return;
    }

    let action = controller[actionName];
    if (action == null) {
        let result = errors.actionNotExists(action, controllerPath);
        next(result);
        return;
    }

    let result = action(applicationId, req.query);
    next(result);

} as express.ErrorRequestHandler);

// userService.options('/*', function (req, res, next) {
//     res.send('');
// })

export = userService;