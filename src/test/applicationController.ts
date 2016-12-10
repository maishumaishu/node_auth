import * as assert from 'assert';
import { User, ApplicationDatabase, Appliation } from '../server/database';
import * as Errors from '../server/errors';
import controller = require('../server/modules/application');

let appId = "4C22F420-475F-4085-AA2F-BE5269DE6043";



describe('ApplicationController', function () {
    //describe('列表', function () {
    it('列表', async function () {
        return controller.list();
    });

    // it('创建Node Auth 后台', async function () {
    //     let app: Appliation = {
    //         name: 'Node Auth 后台',
    //         targetUrl: 'http://localhost:3010'
    //     };

    //     return controller.add({ app });
    // });



    //})
    ApplicationDatabase.createInstance(appId);
})

