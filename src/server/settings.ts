import { Application } from './database';

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
    auth: `mongodb://shopcloud:shop81263cloud@shopcloud_server/node_auth?authMechanism=DEFAULT&authSource=admin`,
    log: `mongodb://shopcloud:shop81263cloud@shopcloud_server/log?authMechanism=DEFAULT&authSource=admin`,
}
export let bindIP = '127.0.0.1';
export let port = 2800;
// export let conn = {
//     auth: `mongodb://shopcloud:shop81263cloud@localhost`,
//     log:  `mongodb://shopcloud:shop81263cloud@localhost`,//`mongodb://${monogoHost}/log`
// }

//====================================
// 测试配置
/** 将 mobile 设为某个号码，则短信往该号码发，以方便测试 */
export let test = {
    mobile: null    //'18502146746'
}
//====================================

verifyCodeText.default = verifyCodeText.register;
verifyCodeText.changeMobile = verifyCodeText.register;
verifyCodeText.receivePassword = verifyCodeText.register;

let remote_host = 'shopcloud_server';   //'114.215.175.79';
export let redirectInfos = {
    pathInfos: [
        { rootDir: 'AdminSite', targetUrl: `http://${remote_host}:9000` },
        { rootDir: 'AdminShop', targetUrl: `http://${remote_host}:9010` },
        { rootDir: 'AdminMember', targetUrl: `http://${remote_host}:9020` },
        { rootDir: 'AdminWeiXin', targetUrl: `http://${remote_host}:9030` },
        { rootDir: 'AdminAccount', targetUrl: `http://${remote_host}:9035` },

        { rootDir: 'UserShop', targetUrl: `http://${remote_host}:9040` },
        { rootDir: 'UserSite', targetUrl: `http://${remote_host}:9050` },
        { rootDir: 'UserMember', targetUrl: `http://${remote_host}:9060` },
        { rootDir: 'UserWeiXin', targetUrl: `http://${remote_host}:9070` },
        { rootDir: 'UserAccount', targetUrl: `http://${remote_host}:9080` },

        // { rootDir: 'AdminSiteTest', targetUrl: `http://${local_host}:9000` },
        // { rootDir: 'AdminShopTest', targetUrl: `http://${local_host}:9010` },
        // { rootDir: 'AdminMemberTest', targetUrl: `http://${local_host}:9020` },
        // { rootDir: 'AdminWeiXinTest', targetUrl: `http://${local_host}:9030` },
        // { rootDir: 'AdminAccountTest', targetUrl: `http://${local_host}:9035` },

        // { rootDir: 'UserShopTest', targetUrl: `http://${local_host}:9040` },
        // { rootDir: 'UserSiteTest', targetUrl: `http://${local_host}:9050` },
        // { rootDir: 'UserMemberTest', targetUrl: `http://${local_host}:9060` },
        // { rootDir: 'UserWeiXinTest', targetUrl: `http://${local_host}:9070` },
        // { rootDir: 'UserAccountTest', targetUrl: `http://${local_host}:9080` },
    ]
}