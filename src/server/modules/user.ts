import { ApplicationDatabase as Database, User, Token } from './../database';
import * as Errors from '../errors';
import * as settings from '../settings';

class UserGroups {
    static normal = 'normal'
}

// export class UserController extends BaseController {
//export let applicationId: string;
async function test() {
    let db = await Database.createInstance(this.applicationId);
    await db.users.deleteMany({ username: 'maishu' });
    let user = <User>{
        username: 'maishu',
        password: '1234',
        mobile: '13431426607',
        email: '81232259@qq.com'
    }
    return register('4C22F420-475F-4085-AA2F-BE5269DE6043', { user });
}
async function createUser(user: User, appId: string) {
    if (user == null)
        throw Errors.argumentNull('user');

    //let appId = applicationId;

    let db = await Database.createInstance(appId)
    let u = await db.users.findOne({ username: user.username })
    if (u != null) {
        throw Errors.userExists(user.username);
    }
    return db.users.insertOne(user);
}
async function registerByUserName(appId: string, { user }) {
    if (user == null)
        throw Errors.argumentNull('user');

    if (user.username == null) {
        throw Errors.fieldNull('username', 'user');
    }
    if (user.password == null) {
        throw Errors.fieldNull('password', 'user');
    }

    return createUser(user, appId);
}
async function registerByMobile({user, smsId, verifyCode, appId}) {
    if (user == null)
        return Promise.reject(Errors.argumentNull('user'));

    if (smsId == null)
        return Promise.reject(Errors.argumentNull('smsId'));

    if (verifyCode == null)
        Promise.reject(Errors.argumentNull('verifyCode'));

    if (user.mobile == null) {
        throw Errors.fieldNull('username', 'user');
    }
    if (user.password == null) {
        throw Errors.fieldNull('password', 'user');
    }

    return createUser(user, appId);
}
export async function register(appId: string, data: { user: User }) {
    if (settings.registerMode == 'username')
        return registerByUserName(appId, data);
    else if (settings.registerMode == 'mobile')
        return registerByMobile(data as any);
    else if (settings.registerMode == 'notAllow')
        throw Errors.notAllowRegister();
    else
        throw Errors.notImplement();
}
export async function login(applicationId: string, {username, password}): Promise<{ token: string } | Error> {
    if (username == null) {
        return Promise.reject<Error>(Errors.argumentNull('username'));
    }
    if (password == null) {
        return Promise.reject<Error>(Errors.argumentNull('password'));
    }

    let db = await Database.createInstance(applicationId);
    let user = await db.users.findOne({ username });
    if (user == null) {
        return Promise.reject<Error>(Errors.userNotExists(username));
    }
    if (user.password != password) {
        return Promise.reject<Error>(Errors.passwordIncorect(username));
    }
    let token = await Token.create(applicationId, user._id, 'user');
    return { token: token.value };
}
function update(args: any) {
    let p = new Promise(() => { });
}
// }



