import { User, Application, Token, DataContext, execute, createDatabaseInstance, tableNames, VerifyMessage } from './../database';
import * as data from '../database';
import * as Errors from '../errors';
import * as settings from '../settings';
import * as mongodb from 'mongodb';
import * as os from 'os';

import { Controller } from '../common';
import { default as AppliationController } from '../adminControllers/application';
import { ObjectID } from 'mongodb';

async function findUserByMobile(db: mongodb.Db, mobile: string, applicationId: mongodb.ObjectID): Promise<User> {
    let users = db.collection(tableNames.User);
    return users.findOne<User>({ $and: [{ mobile }, { applicationId }] });
}

export async function checkVerifyCode(db: mongodb.Db, mobile: string, smsId: string, verifyCode: string, appId?: mongodb.ObjectID) {

    let verifyMessages = db.collection(tableNames.VerifyMessage);
    let msg: VerifyMessage
    if (appId != null)
        msg = await verifyMessages.findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId), applicationId: appId });
    else
        msg = await verifyMessages.findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId) });

    if (msg == null)
        throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

    if (msg.verifyCode != verifyCode)
        throw Errors.verifyCodeIncorrect(verifyCode);

    if (msg.mobile != mobile)
        throw Errors.verifyCodeNotMatchMobile(mobile);

}

export default class UserController extends Controller {
    appId: mongodb.ObjectID;
    userId: mongodb.ObjectID;

    async  test() {
        let db = await this.createDatabaseInstance(settings.conn.auth);
        let users = db.collection(tableNames.User);
        await users.deleteMany({ username: 'maishu' });
        let user = <User>{
            username: 'maishu',
            password: '1234',
            mobile: '13431426607',
            email: '81232259@qq.com',
            applicationId: this.appId,
        }
        return this.register({ user });
    }
    async createUser(user: User, db?: mongodb.Db) {
        if (user == null)
            throw Errors.argumentNull('user');

        console.assert(this.appId != null, 'appId is null');
        if (db == null) {
            db = await this.createDatabaseInstance(settings.conn.auth);
        }

        let collection = db.collection(tableNames.User);
        let result: Promise<any>;
        if (user.mobile != null) {
            let u = await collection.findOne<User>({ $and: [{ mobile: user.mobile }, { applicationId: this.appId }] });
            if (u != null)
                throw Errors.mobileExists(user.mobile);
        }
        else {
            console.assert(user.username != null);
            let u = await collection.findOne<User>({ $and: [{ username: user.username }, { applicationId: this.appId }] });
            if (u != null) {
                throw Errors.usernameExists(user.username);
            }
        }

        user.createDateTime = new Date(Date.now());
        user.applicationId = this.appId;
        await collection.insertOne(user);

        delete user.password;
        return user;
    }
    async registerByUserName(user: User) {
        if (user == null)
            throw Errors.argumentNull('user');

        if (user.username == null) {
            throw Errors.fieldNull('username', 'user');
        }
        if (user.password == null) {
            throw Errors.fieldNull('password', 'user');
        }

        return this.createUser(user);
    }
    async registerByMobile({ user, smsId, verifyCode }): Promise<any> {
        if (user == null)
            return Promise.reject(Errors.argumentNull('user'));

        if (smsId == null)
            return Promise.reject(Errors.argumentNull('smsId'));

        if (verifyCode == null)
            throw Errors.argumentNull('verifyCode');

        if (user.mobile == null) {
            throw Errors.fieldNull('mobile', 'user');
        }
        if (user.password == null) {
            throw Errors.fieldNull('password', 'user');
        }

        console.assert(this.appId != null);
        let db = await this.createDatabaseInstance(settings.conn.auth);
        let msg = await db.collection(tableNames.VerifyMessage).findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId) });
        if (msg == null)
            throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

        if (msg.verifyCode != verifyCode)
            throw Errors.verifyCodeIncorrect(verifyCode);

        return this.createUser(user);
    }
    async register({ user, smsId, verifyCode }: { user: User, smsId?: string, verifyCode?: string }) {
        let u: User;
        if (smsId != null && verifyCode != null) {
            u = await this.registerByMobile({ user, smsId, verifyCode });
        }
        else {
            u = await this.registerByUserName(user);
        }

        let token = await Token.create(u._id, 'user');
        return { token: token._id.toHexString(), userId: token.objectId };
    }
    async login({ username, password }): Promise<{ token: string, userId: ObjectID } | Error> {
        if (username == null) {
            return Promise.reject<Error>(Errors.argumentNull('username'));
        }
        if (password == null) {
            return Promise.reject<Error>(Errors.argumentNull('password'));
        }


        let db = await this.createDatabaseInstance(settings.conn.auth);
        // let result = await createDatabaseInstance(settings.conn.auth, async (db) => {
        let users = db.collection(tableNames.User);
        let user = await users.findOne<User>({ $and: [{ $or: [{ username }, { mobile: username }] }, { applicationId: this.appId }] });

        if (user == null) {
            return Promise.reject<Error>(Errors.userNotExists(username));
        }
        if (user.password != password) {
            return Promise.reject<Error>(Errors.passwordIncorect(username));
        }

        let token = await Token.create(user._id, 'user');
        return { token: token._id.toHexString(), userId: token.objectId };
        // });
        // return result;
    }

    /** 重置密码，用户无需登录 */
    async resetPassword({ mobile, password, smsId, verifyCode }) {
        if (smsId == null)
            return Promise.reject(Errors.argumentNull('smsId'));

        if (verifyCode == null)
            throw Errors.argumentNull('verifyCode');

        if (mobile == null) {
            throw Errors.argumentNull('mobile');
        }
        if (password == null) {
            throw Errors.argumentNull('password');
        }

        let db = await this.createDatabaseInstance(settings.conn.auth);
        // let result = await createDatabaseInstance(settings.conn.auth, async (db) => {
        let verifyMessages = db.collection(tableNames.VerifyMessage);
        let msg = await verifyMessages.findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId) });
        if (msg == null)
            throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

        if (msg.verifyCode != verifyCode)
            throw Errors.verifyCodeIncorrect(verifyCode);

        let users = db.collection(tableNames.User);
        let u = await users.updateOne(
            { $and: [{ mobile: mobile }, { applicationId: this.appId }] },
            { $set: { password: password } }
        );

        // debugger;
        if (u.matchedCount <= 0) {
            throw Errors.userNotExists(mobile);
        }

        return u;
        // });

        // return result;
    }

    /** 修改密码，用户需要处于登录状态 */
    async changePassword({ password, smsId, verifyCode }) {
        if (!this.userId)
            throw Errors.userIdRequired();

        if (!password)
            throw Errors.argumentNull('password');

        if (!smsId)
            throw Errors.argumentNull("smsId");

        if (!verifyCode)
            throw Errors.argumentNull('verifyCode');

        // let msg = await execute(settings.conn.auth, tableNames.VerifyMessage, async verifyMessages => {
        let db = await this.createDatabaseInstance(settings.conn.auth);
        let verifyMessages = db.collection(tableNames.VerifyMessage);
        let msg = await verifyMessages.findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId) });
        // });

        if (msg == null)
            throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

        if (msg.verifyCode != verifyCode)
            throw Errors.verifyCodeIncorrect(verifyCode);

        let result = await execute(settings.conn.auth, tableNames.User, async users => {
            return users.updateOne(
                { _id: this.userId },
                { $set: { password } });
        });

        return result;
    }

    async userInfo() {
        if (!this.userId) return null;

        // let user = await execute(settings.conn.auth, tableNames.User, async collection => {
        let db = await this.createDatabaseInstance(settings.conn.auth);
        let collection = db.collection(tableNames.User);
        let user = await collection.findOne<User>({ _id: this.userId });
        // });
        delete user.password;

        return user;
    }

    async changeMobile({ mobile, smsId, verifyCode }) {
        let db = await this.createDatabaseInstance(settings.conn.auth);
        await checkVerifyCode(db, mobile, smsId, verifyCode, this.appId);

        let user = await findUserByMobile(db, mobile, this.appId);
        if (user != null)
            throw Errors.mobileExists(mobile);

        let users = db.collection<User>(tableNames.User);
        return users.findOneAndUpdate({ _id: this.userId }, { $set: { mobile } });
        // });
    }

    async list() {
        let db = await this.createDatabaseInstance(settings.conn.auth);
        let users = db.collection<User>(tableNames.User);
        return users.find({ applicationId: this.appId });
    }

    /** 用于客户端测试连接速度 */
    async index() {
        return os.hostname();
    }
}

