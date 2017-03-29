
export const monogoHost = 'alinq.cn:27017';
export const registerMode: 'username' | 'mobile' | 'notAllow' = 'mobile';
export const verifyCodeText = '欢迎关注零食有约，您的验证码是{0}【零食有约】';
export const verifyCodeLength = 4;
export const pageSize = 20;
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
//====================================
