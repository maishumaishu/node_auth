// import { DataContext, tableNames, Application, Token, Admin } from '../database';
// // import * as data from '../database';
// import { Controller } from '../common';
// import { conn, pageSize } from '../settings';
// import * as errors from '../errors';
// import { default as AppliationController } from './application';
// import { default as UserController, checkVerifyCode } from '../userControllers/user';
// import { ObjectID, Db } from 'mongodb';
// import * as settings from '../settings';

// export default class AdminController extends Controller {

//     userId: ObjectID;

//     private OWNER_ROLE = 'owner';
//     async list({ pageIndex, appId }) {
//         if (!appId)
//             throw errors.argumentNull('appId');

//         if (pageIndex == null)
//             pageIndex = 0;

//         // var p1 = execute(conn.auth, tableNames.User, (collection) => {
//         //     var cursor = collection.find().sort({ createDateTime: -1 });
//         //     return cursor.toArray();
//         // });

//         // let p2 = execute(conn.auth, tableNames.User, async (collection) => {
//         //     // return new Promise((resolve, reject) => {
//         //     var c = await collection.count();
//         //     return c;
//         // });

//         // let result = await Promise.all([p1, p2]);

//         let db = await this.createDatabaseInstance(conn.auth);
//         let collection = db.collection(tableNames.User);
//         let cursor = collection.find().sort({ createDateTime: -1 });
//         let p1 = cursor.toArray();

//         let p2 = await collection.count();
//         let result = await Promise.all([p1, p2]);
//         return {
//             dataItems: result[0],
//             totalRowCount: result[1]
//         }
//     }

//     //====================================================
//     // 商家注册
//     /** 手机是否已注册 */
//     async isMobileRegister({ mobile }) {
//         let role = this.OWNER_ROLE;
//         let db = await this.createDatabaseInstance(conn.auth);
//         let users = db.collection(tableNames.Admin);
//         let u = await users.findOne<Admin>({ mobile, role });
//         return u != null;
//     }
//     async register({ user, smsId, verifyCode }: { user: Admin, smsId: string, verifyCode: string }) {
//         if (user == null)
//             throw errors.argumentNull('user');

//         if (user.mobile == null)
//             throw errors.fieldNull('mobile', 'user');

//         if (smsId == null)
//             throw errors.argumentNull('smsId');

//         if (verifyCode == null)
//             throw errors.argumentNull('verifyCode');


//         user.role = this.OWNER_ROLE;
//         let { mobile, role } = user;

//         let isMobileRegister = await this.isMobileRegister({ mobile });
//         if (isMobileRegister)
//             throw errors.mobileExists(mobile);

//         let db = await this.createDatabaseInstance(conn.auth);

//         await checkVerifyCode(db, user.mobile, smsId, verifyCode);

//         let admins = db.collection(tableNames.Admin);
//         // let applications = db.collection(tableNames.Application);
//         // let defaultApplication = await applications.findOne<data.Application>({ name: 'ShopCloud' });
//         // if (defaultApplication == null)
//         //     throw errors.applicationNotExists('ShopCloud');

//         // let app = Object.assign({}, defaultApplication);
//         // app.name = data.guid();
//         // let applicationController = new AppliationController();
//         // app = await applicationController.add({ app });
//         // let app = await applicationController.add({ app: defaultApplication });

//         // let userController = new UserController();
//         // userController.appId = app._id;
//         //, appToken: app.token
//         let u = await this.createUser(user, db);

//         let token = await Token.create(u._id, 'admin');
//         return { token: token._id.toHexString(), userId: token.objectId };
//     }

//     private async createUser(admin: Admin, db?: Db) {
//         if (admin == null)
//             throw errors.argumentNull('user');

//         // console.assert(this.appId != null, 'appId is null');
//         if (db == null) {
//             db = await this.createDatabaseInstance(settings.conn.auth);
//         }

//         let collection = db.collection(tableNames.Admin);
//         let result: Promise<any>;
//         if (admin.mobile != null) {
//             let u = await collection.findOne<Admin>({ $and: [{ mobile: admin.mobile }] });
//             if (u != null)
//                 throw errors.mobileExists(admin.mobile);
//         }
//         else {
//             console.assert(admin.username != null);
//             let u = await collection.findOne<Admin>({ $and: [{ username: admin.username }] });
//             if (u != null) {
//                 throw errors.usernameExists(admin.username);
//             }
//         }

//         admin.createDateTime = new Date(Date.now());
//         await collection.insertOne(admin);
//         return admin;
//     }

//     async login({ username, password }) {
//         let db = await this.createDatabaseInstance(conn.auth);
//         let admins = db.collection(tableNames.Admin);
//         let admin = await admins.findOne<Admin>({ mobile: username, role: this.OWNER_ROLE });
//         if (admin == null)
//             throw errors.adminNotExists(username);

//         if (admin.password != password)
//             throw errors.passwordIncorect(username);

//         // let applications = db.collection(tableNames.Application);
//         // let result = await Promise.all([applications.findOne<Application>({ _id: user.applicationId }), data.Token.create(user._id, "user")]);
//         // let app = result[0]
//         // let token = result[1];
//         // console.assert(app != null, `app ${user.applicationId} is not exites`);
//         // return { token: token._id.toHexString(), userId: token.objectId, appToken: app.token };
//         var token = await Token.create(admin._id, "admin");
//         return { token: token._id.toHexString(), userId: admin._id };
//     }

//     /** 添加应用 */
//     async addApplication({ app }: { app: Application }): Promise<Application> {
//         if (!app) throw errors.argumentNull('app');
//         if (!app.name) throw errors.fieldNull('name', 'app');
//         if (!this.userId) throw errors.userIdRequired();

//         let db = await this.createDatabaseInstance(settings.conn.auth);
//         let table = db.collection(tableNames.Application);
//         let item: Application = await table.findOne<Application>({ name: app.name });
//         if (item != null) {
//             return Promise.reject(errors.applicationExists(app.name));
//         }

//         app._id = new ObjectID();
//         let tokenObject = await Token.create(app._id, 'app');
//         app.token = tokenObject._id.toHexString();
//         app.adminId = this.userId;

//         await table.insertOne(app);
//         return app;
//     }

//     /** 获取管理员所创建的应用 */
//     async applications() {
//         let db = await this.createDatabaseInstance(settings.conn.auth);
//         let collection = db.collection(tableNames.Application);
//         // return execute(settings.conn.auth, tableNames.Application, async (collection) => {
//         let cursor = await collection.find({ adminId: this.userId });
//         console.assert(cursor != null);
//         let items = await cursor.toArray();
//         return items;
//         // });
//     }

//     async deleteApplication({ appId }) {
//         if (!appId) throw errors.argumentNull('appId');

//         appId = ObjectID.createFromHexString(appId);
//         let db = await this.createDatabaseInstance(settings.conn.auth);
//         let collection = db.collection(tableNames.Application);
//         // return execute(settings.conn.auth, tableNames.Application, async (collection) => {
//         let result = await collection.deleteOne({ _id: appId });
//         return result;
//         // });
//     }
// }