import { Database, User, Token, DataContext, execute, createDB, tableNames, VerifyMessage } from './../database';
import * as Errors from '../errors';
import * as settings from '../settings';
import * as mongodb from 'mongodb';
import { Controller } from '../common';

export default class UserController extends Controller {
    async  test() {
        let db = await Database.createInstance();
        //this.appId
        await db.users.deleteMany({ username: 'maishu' });
        let user = <User>{
            username: 'maishu',
            password: '1234',
            mobile: '13431426607',
            email: '81232259@qq.com',
            applicationId: this.appId,
        }
        return this.register(user);
    }
    createUser(user: User) {
        if (user == null)
            throw Errors.argumentNull('user');

        console.assert(this.appId != null);

        return execute(settings.conn.auth, tableNames.User, async (collection) => {
            let result: Promise<any>;
            // let u: User;
            if (user.mobile != null) {
                let u = await collection.findOne<User>({ $and: [{ mobile: user.mobile }, { applicationId: this.appId }] });
                if (u != null) {
                    result = Promise.reject(Errors.mobileExists(user.mobile));
                }
            }
            else {
                console.assert(user.username != null);
                let u = await collection.findOne<User>({ $and: [{ username: user.username }, { applicationId: this.appId }] });
                if (u != null) {
                    result = Promise.reject(Errors.usernameExists(user.username));
                }
            }

            if (result == null) {
                user.createDateTime = new Date(Date.now());
                user.applicationId = this.appId;
                await collection.insertOne(user);
                result = Promise.resolve(user);
            }
            return result;
        });
    }
    async registerByUserName(user) {
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
        // let db = await Database.createInstance();//this.appId
        // let msg = await db.verifyMessages.findOne({ _id: new mongodb.ObjectID(smsId) });
        // db.close();
        let msg = await execute(settings.conn.auth, tableNames.VerifyMessage, async (collection) => {
            return collection.findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId) });
        });
        if (msg == null)
            throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

        if (msg.verifyCode != verifyCode)
            throw Errors.verifyCodeIncorrect(verifyCode);

        return this.createUser(user);
    }
    async register(args) {
        let user: User;
        if (settings.registerMode == 'username')
            user = await this.registerByUserName(args);
        else if (settings.registerMode == 'mobile')
            user = await this.registerByMobile(args);
        else if (settings.registerMode == 'notAllow')
            throw Errors.notAllowRegister();
        else
            throw Errors.notImplement();

        let token = await Token.create(user._id.toHexString(), 'user');
        return { token: token._id.toHexString(), userId: token.objectId };
    }
    async login({ username, password }): Promise<{ token: string } | Error> {
        if (username == null) {
            return Promise.reject<Error>(Errors.argumentNull('username'));
        }
        if (password == null) {
            return Promise.reject<Error>(Errors.argumentNull('password'));
        }


        let result = await createDB(settings.conn.auth, async (db) => {
            let users = db.collection(tableNames.User);
            let user = await users.findOne<User>({ $and: [{ $or: [{ username }, { mobile: username }] }, { applicationId: this.appId }] });

            if (user == null) {
                return Promise.reject<Error>(Errors.userNotExists(username));
            }
            if (user.password != password) {
                return Promise.reject<Error>(Errors.passwordIncorect(username));
            }

            let token = await Token.create(user._id.toHexString(), 'user');
            return { token: token._id.toHexString(), userId: token.objectId };
        });
        return result;
    }
    async resetPassword({ user, smsId, verifyCode }) {
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

        let result = await createDB(settings.conn.auth, async (db) => {
            let verifyMessages = db.collection(tableNames.VerifyMessage);
            let msg = await verifyMessages.findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId) });
            if (msg == null)
                throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

            if (msg.verifyCode != verifyCode)
                throw Errors.verifyCodeIncorrect(verifyCode);

            let users = db.collection(tableNames.User);
            let u = await users.updateOne(
                { $and: [{ mobile: user.mobile }, { applicationId: this.appId }] },
                { $set: { password: user.password } }
            );

            // debugger;
            if (u.matchedCount <= 0) {
                throw Errors.userNotExists(user.mobile);
            }

            return u;
        });

        return result;
    }

    async userInfo() {
        if (!this.userId) return null;

        let user = await execute(settings.conn.auth, tableNames.User, async collection => {
            return collection.findOne<User>({ _id: this.userId });
        });

        return user;
    }

    async changeMobile({ mobile, smsId, verifyCode }) {
        let msg = await execute(settings.conn.auth, tableNames.VerifyMessage, async (collection) => {
            return collection.findOne<VerifyMessage>({ _id: new mongodb.ObjectID(smsId) });
        });
        if (msg == null)
            throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

        if (msg.verifyCode != verifyCode)
            throw Errors.verifyCodeIncorrect(verifyCode);

        let result = await execute(settings.conn.auth, tableNames.User, async (collection) => {
            collection.findOneAndUpdate({ _id: this.userId }, { mobile: mobile });
        });

        return result;

    }

}


class UserGroups {
    static normal = 'normal'
}


function update(args: any) {
    let p = new Promise(() => { });
}
// }



