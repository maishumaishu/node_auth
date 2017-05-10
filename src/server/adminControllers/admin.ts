import { DataContext, tableNames, execute, Application, Token } from '../database';
import * as data from '../database';
import { Controller } from '../common';
import { conn, pageSize } from '../settings';
import * as errors from '../errors';
import { default as AppliationController } from './application';
import { default as UserController, checkVerifyCode } from '../userControllers/user';
import { ObjectID } from 'mongodb';

export default class AdminController extends Controller {
    private OWNER_ROLE = 'owner';
    async list({ pageIndex, appId }) {
        if (!appId)
            throw errors.argumentNull('appId');

        if (pageIndex == null)
            pageIndex = 0;

        var p1 = execute(conn.auth, tableNames.User, (collection) => {
            var cursor = collection.find().sort({ createDateTime: -1 });
            return cursor.toArray();
        });

        let p2 = execute(conn.auth, tableNames.User, async (collection) => {
            // return new Promise((resolve, reject) => {
            var c = await collection.count();
            return c;
        });

        let result = await Promise.all([p1, p2]);
        return {
            dataItems: result[0],
            totalRowCount: result[1]
        }
    }

    //====================================================
    // 商家注册
    /** 手机是否已注册 */
    async isMobileRegister({ mobile }) {
        let role = this.OWNER_ROLE;
        let db = await this.createDatabaseInstance(conn.auth);
        let users = db.collection(tableNames.User);
        let u = await users.findOne<data.User>({ mobile, role });
        return u != null;
    }
    async register({ user, smsId, verifyCode }: { user: data.User, smsId: string, verifyCode: string }) {
        if (user == null)
            throw errors.argumentNull('user');

        if (user.mobile == null)
            throw errors.fieldNull('mobile', 'user');

        if (smsId == null)
            throw errors.argumentNull('smsId');

        if (verifyCode == null)
            throw errors.argumentNull('verifyCode');


        user.role = this.OWNER_ROLE;
        let { mobile, role } = user;

        let isMobileRegister = await this.isMobileRegister({ mobile });
        if (isMobileRegister)
            throw errors.mobileExists(mobile);

        let db = await this.createDatabaseInstance(conn.auth);

        await checkVerifyCode(db, user.mobile, smsId, verifyCode);

        let users = db.collection(tableNames.User);
        let applications = db.collection(tableNames.Application);
        let defaultApplication = await applications.findOne<data.Application>({ name: 'ShopCloud' });
        if (defaultApplication == null)
            throw errors.applicationNotExists('ShopCloud');

        let app = Object.assign({}, defaultApplication);
        app.name = data.guid();
        let applicationController = new AppliationController();
        app = await applicationController.add({ app });
        // let app = await applicationController.add({ app: defaultApplication });

        let userController = new UserController();
        userController.appId = app._id;
        let u = await userController.createUser(user, db);

        debugger;
        let token = await Token.create(u._id, 'user');
        return { token: token._id.toHexString(), userId: token.objectId, appToken: app.token };
    }

    async login({ username, password }) {
        let db = await this.createDatabaseInstance(conn.auth);
        let users = db.collection(tableNames.User);
        let user = await users.findOne<data.User>({ mobile: username, role: this.OWNER_ROLE });
        if (user == null)
            throw errors.userNotExists(username);

        if (user.password != password)
            throw errors.passwordIncorect(username);

        let applications = db.collection(tableNames.Application);
        let result = await Promise.all([applications.findOne<Application>({ _id: user.applicationId }), data.Token.create(user._id, "user")]);
        let app = result[0]
        let token = result[1];
        console.assert(app != null, `app ${user.applicationId} is not exites`);
        return { token: token._id.toHexString(), userId: token.objectId, appToken: app.token };
    }
}