import { ApplicationDatabase as Database, User, Token } from './../database';
import * as Errors from '../errors';
import * as settings from '../settings';
import * as mongodb from 'mongodb';
import { Controller } from '../common';

//export let config: { appId: string, userId: string };

export default class UserController extends Controller {
    async  test() {
        let db = await Database.createInstance(this.appId);
        await db.users.deleteMany({ username: 'maishu' });
        let user = <User>{
            username: 'maishu',
            password: '1234',
            mobile: '13431426607',
            email: '81232259@qq.com'
        }
        return this.register(user);
    }
    async  createUser(user: User) {
        if (user == null)
            throw Errors.argumentNull('user');

        console.assert(this.appId != null);
        let db = await Database.createInstance(this.appId)
        let u: User;
        let result: Promise<any>;
        if (user.mobile != null) {
            u = await db.users.findOne({ mobile: user.mobile });
            if (u != null)
                result = Promise.reject(Errors.mobileExists(user.mobile));
        }
        else {
            console.assert(user.username != null);
            u = await db.users.findOne({ username: user.username });
            if (u != null)
                result = Promise.reject(Errors.usernameExists(user.username)); //throw Errors.usernameExists(user.username);
        }

        if (result == null) {
            u = await db.users.insertOne(user);
            result = Promise.resolve(u);
        }

        db.close();
        return result;
    }
    async  registerByUserName(user) {
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
    async  registerByMobile({user, smsId, verifyCode}): Promise<any> {
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
        let db = await Database.createInstance(this.appId);
        let msg = await db.verifyMessages.findOne({ _id: new mongodb.ObjectID(smsId) });
        db.close();

        if (msg == null)
            throw Errors.objectNotExistWithId(smsId, 'VerifyMessages');

        if (msg.verifyCode != verifyCode)
            throw Errors.verifyCodeIncorrect(verifyCode);

        return this.createUser(user);
    }
    async  register(args) {
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
    async  login({username, password}): Promise<{ token: string } | Error> {
        if (username == null) {
            return Promise.reject<Error>(Errors.argumentNull('username'));
        }
        if (password == null) {
            return Promise.reject<Error>(Errors.argumentNull('password'));
        }

        console.assert(this.appId != null);
        let db = await Database.createInstance(this.appId);
        //TODO:根据 username 格式进行选择
        let user = await db.users.findOne({ $or: [{ username }, { mobile: username }] });
        if (user == null) {
            return Promise.reject<Error>(Errors.userNotExists(username));
        }
        if (user.password != password) {
            return Promise.reject<Error>(Errors.passwordIncorect(username));
        }
        let token = await Token.create(user._id.toHexString(), 'user');
        db.close();
        
        return { token: token._id.toHexString(), userId: token.objectId };
    }
}


class UserGroups {
    static normal = 'normal'
}


function update(args: any) {
    let p = new Promise(() => { });
}
// }



