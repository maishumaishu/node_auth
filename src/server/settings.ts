const APP_KEY = 'application-id';
const USER_TOKEN = 'token';
const STORE_KEY = 'store-key';
export let allowHeaders = `${APP_KEY}, ${USER_TOKEN}, ${STORE_KEY}, content-type`;
export let conn = {
    auth: { host: 'localhost', user: 'liuyunyuan', password: 'Xuan520Lv', database: 'node_auth' },
}
export let bindIP = '0.0.0.0';
export let port = 2800;

let remote_host = '192.168.1.19';   //'114.215.175.79';
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
    ]
}