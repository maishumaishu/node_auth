import { Application } from './database';

export const monogoHost = 'localhost:27017';//'alinq.cn:27017';
export const registerMode: 'username' | 'mobile' | 'notAllow' = 'mobile';
export const verifyCodeText = {
    default: '您的验证码是{0}【零食有约】',
    register: '欢迎关注零食有约，您的验证码是{0}【零食有约】',
    changeMobile: '您正在修改手机号，验证码是{0}【零食有约】',
    receivePassword: '您正在修改密码，验证码是{0}【零食有约】'
}
export const verifyCodeLength = 4;
export const pageSize = 20;

const APP_KEY = 'application-key';
const USER_TOKEN = 'user-token';
const STORE_KEY = 'store-key';
export let allowHeaders = `${APP_KEY}, ${USER_TOKEN}, ${STORE_KEY}, content-type`;
//export const conn = `mongodb://${monogoHost}/node_auth`;
export let conn = {
    auth: `mongodb://${monogoHost}/node_auth`,
    log: `mongodb://${monogoHost}/log`
}

//====================================
// 测试配置
export let test = {
    mobile: '18502146746'
}

verifyCodeText.default = verifyCodeText.register;
verifyCodeText.changeMobile = verifyCodeText.register;
verifyCodeText.receivePassword = verifyCodeText.register;
// if (test) {
//     monogoHost = '192.168.1.1:27017';
// }
//====================================

// export let defaultApplication: Application = {
//     name: 'ShopCloud',
//     targetUrl: 'http://localhost:3010',
//     token: '0000000',
//     pathInfos:[

//     ]
// }

let host = 'localhost'
export let redirectInfos = {
    pathInfos: [
        { rootDir: 'AdminSite', targetUrl: `http://${host}:9000` },
        { rootDir: 'AdminShop', targetUrl: `http://${host}:9010` },
        { rootDir: 'AdminMember', targetUrl: `http://${host}:9020` },
        { rootDir: 'AdminWeiXin', targetUrl: `http://${host}:9030` },

        { rootDir: 'UserShop', targetUrl: `http://${host}:9040` },
        { rootDir: 'UserSite', targetUrl: `http://${host}:9050` },
        { rootDir: 'UserMember', targetUrl: `http://${host}:9060` },
        { rootDir: 'UserWeiXin', targetUrl: `http://${host}:9070` },
        { rootDir: 'UserAccount', targetUrl: `http://${host}:9080` },

        { rootDir: 'AdminSiteTest', targetUrl: `http://${host}:9000` },
        { rootDir: 'AdminShopTest', targetUrl: `http://${host}:9010` },
        { rootDir: 'AdminMemberTest', targetUrl: `http://${host}:9020` },
        { rootDir: 'AdminWeiXinTest', targetUrl: `http://${host}:9030` },

        { rootDir: 'UserShopTest', targetUrl: `http://${host}:9040` },
        { rootDir: 'UserSiteTest', targetUrl: `http://${host}:9050` },
        { rootDir: 'UserMemberTest', targetUrl: `http://${host}:9060` },
        { rootDir: 'UserWeiXinTest', targetUrl: `http://${host}:9070` },
        { rootDir: 'UserAccountTest', targetUrl: `http://${host}:9080` },
    ]
}