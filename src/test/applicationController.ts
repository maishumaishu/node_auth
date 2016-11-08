import * as assert from 'assert';
import { User, ApplicationDatabase } from '../server/database';
import { ApplicationController } from '../server/controllers/application';
import * as Errors from '../server/errors';

let appId = "4C22F420-475F-4085-AA2F-BE5269DE6043";

function createController(): ApplicationController {
    let controller = new ApplicationController();
    controller.applicationId = appId;
    return controller;
}

describe('ApplicationController', function () {
    //describe('列表', function () {
    it('列表', async function () {
        let controller = createController();
        return controller.list();
    });
    //})
    ApplicationDatabase.createInstance(appId);
})
