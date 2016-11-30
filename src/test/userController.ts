import * as assert from 'assert';
import { User, ApplicationDatabase as Database } from '../server/database';
import * as controller from '../server/modules/user';
import * as Errors from '../server/errors';

let appId = "4C22F420-475F-4085-AA2F-BE5269DE6043";
let user = <User>{
    username: 'maishu',
    password: '1234',
    mobile: '13431426607',
    email: '81232259@qq.com'
}

function createUserController() {
    // let controller = new UserController();
    // controller.applicationId = appId;
    return controller;
}

describe('UserController', function () {
    describe('注册', function () {
        it('注册用户', async function () {
            let db = await Database.createInstance(appId);
            await db.users.deleteMany({ username: 'maishu' });

            let controller = createUserController();
            return controller.register({appId,  user }).then(async () => {
                let user = await db.users.findOne({ username: 'maishu' });
                if (user == null)
                    return Promise.reject<any>(new Error('用户找不到'));

                return Promise.resolve<any>({});
            });
        });
        it('用户名已存在', async () => {
            try {
                let db = await Database.createInstance(appId);
                await db.users.deleteMany({ username: 'maishu' });

                let controller = createUserController();
                await controller.register({appId,  user });
                await controller.register({appId,  user });
                Promise.reject(new Error('Error:重复注册用户'));
            }
            catch (exc) {
                if ((<Error>exc).name != Errors.names.UserExists) {
                    throw exc;
                }
                return Promise.resolve();
            }
        });
        it('手机号码已存在', (done) => done());
    })
    describe('登录', function () {
        it('成功登录', async function () {
            let db = await Database.createInstance(appId);
            await db.users.deleteMany({ username: 'maishu' });

            let controller = createUserController();
            await controller.register({appId, user });
            let result = await controller.login(appId, { username: user.username, password: user.password });

            assert.notDeepEqual((<{ token: string }>result).token, null);
            return result;
        });
        it('登录不存在的用户', async function () {
            try {
                let db = await Database.createInstance(appId);
                await db.users.deleteMany({ username: 'maishu' });

                let controller = createUserController();
                await controller.login(appId, user);
                throw new Error('Error:不存在用户可登录');
            }
            catch (exc) {
                if ((<Error>exc).name != Errors.names.UserNotExists)
                    throw exc;

                return Promise.resolve();
            }
        });
        it('以错误的密码登录', async function () {
            try {
                let db = await Database.createInstance(appId);
                await db.users.deleteMany({ username: 'maishu' });

                let controller = createUserController();
                await controller.register({appId, user });
                //let {username, password} = user;
                let username = user.username;
                let password = user.password;
                let result = await controller.login(appId, { username, password: password + 'bbb' });
                throw new Error('Error:不正确的密码也可以登录');
            }
            catch (exc) {
                if ((<Error>exc).name != Errors.names.PasswordIncorect)
                    throw exc;

                return Promise.resolve();
            }
        });
    });
});

//FOR TEST GIT