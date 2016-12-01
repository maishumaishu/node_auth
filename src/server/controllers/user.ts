import { ApplicationDatabase as Database, User, Token } from './../database';
import * as Errors from '../errors';
import { BaseController } from './baseController'
import * as settings from '../settings';
import * as mongodb from 'mongodb';

class UserGroups {
    static normal = 'normal'
}

// export class UserController extends BaseController {
async function test() {
    let db = await Database.createInstance(this.applicationId);
    await db.users.deleteMany({ username: 'maishu' });
    let user = <User>{
        username: 'maishu',
        password: '1234',
        mobile: '13431426607',
        email: '81232259@qq.com'
    }
    return this.register({ user });
}

async function createUser(user: User) {
    let appId = this.applicationId;

    let db = await Database.createInstance(appId)
    let u = await db.users.findOne({
        $or: [{ username: user.username }, { mobile: user.mobile }]
    })
    if (u != null) {
        if (u.mobile == user.mobile)
            throw Errors.mobileIsBind(user.mobile);

        throw Errors.userExists(user.username);
    }
    return db.users.insertOne(user);
}

async function registerByUserName({ user }: { user: User }) {
    if (user.username == null) {
        throw Errors.fieldNull('username', 'User');
    }
    if (user.password == null) {
        throw Errors.fieldNull('password', 'User');
    }

    return this.createUser(user);
}

type RegisterByMobileArguments = { appId, user: User, smsId, verifyCode };
async function registerByMobile({ appId, user, smsId, verifyCode }: RegisterByMobileArguments) {
    if (user.mobile == null) {
        throw Errors.fieldNull('username', 'User');
    }
    if (user.password == null) {
        throw Errors.fieldNull('password', 'User');
    }
    if (smsId == null) {
        throw Errors.argumentNull('smsId');
    }
    if (verifyCode == null) {
        throw Errors.argumentNull('verifyCode');
    }

    let db = await Database.createInstance(appId);
    let msg = await db.verifyMessages.findOne({ _id: new mongodb.ObjectID(smsId) });
    if (msg == null)
        throw Errors.objectNotExistWithId(smsId, 'VerifyMessage');

    if (msg.verifyCode != verifyCode)
        throw Errors.verifyCodeIncorrect(verifyCode);

    return createUser(user);
}

export async function register(args: { user: User }) {
    if (settings.registerMode == 'username')
        return registerByUserName(args);
    else if (settings.registerMode == 'mobile')
        return registerByMobile(<any>args);
    else if (settings.registerMode == 'notAllow')
        throw Errors.notAllowRegister();
    else
        throw Errors.notImplement();
}

export async function login({applicationId, username, password }): Promise<{ token: string }> {
    if (username == null) {
        throw Errors.argumentNull('username');
    }
    if (password == null) {
        throw Errors.argumentNull('password');
    }

    let db = await Database.createInstance(applicationId);
    let user = await db.users.findOne({ username: username });
    if (user == null) {
        throw Errors.userNotExists(username);
    }
    if (user.password != password) {
        throw Errors.passwordIncorect(username);
    }
    let token = await Token.create(this.applicationId, user._id, 'user');
    return { token: token.value };
}
function update(args: any) {
    let p = new Promise(() => { });

}
// }



