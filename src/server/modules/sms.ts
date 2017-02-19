import * as querystring from 'querystring';
import * as data from './../database';
import * as settings from '../settings';
import * as Errors from '../errors'
import * as http from 'http';
import { UserSubmitData, Controller } from '../common';
import { ApplicationDatabase, VerifyMessage } from '../database';

export default class SMSController extends Controller {
    async  sendVerifyCode(args: SendCodeArgumentType): Promise<{ smsId: string } | Error> {
        console.assert(appId != null);

        let {mobile, type} = args;
        if (mobile == null)
            throw Errors.argumentNull('mobile');
        if (type == null)
            throw Errors.argumentNull('type');
        //TODO:验证参数的正确性

        //=======================================
        // 说明：生成一个大于或等于验证码长度的随机字符串
        let num: number;
        do {
            num = Math.random();
        }
        while (num == 0);
        //=======================================
        // 使用 str 必定大于 verifyCodeLength，如果不足则 0 补足
        let str = num.toString().substr(2) + '0'.repeat(verifyCodeLength);
        //=======================================
        let verifyCode = str.substr(0, verifyCodeLength);
        let msg = settings.verifyCodeText.replace('{0}', verifyCode);

        await sendMobileMessage(mobile, msg);
        let db = await ApplicationDatabase.createInstance(appId);
        let verifyMessage: VerifyMessage = {
            verifyCode,
            content: msg
        }
        let result = await db.verifyMessages.insertOne(verifyMessage);
        db.close();
        return { smsId: result._id.toHexString() };
    }
}


export var appId: string = null;

let verifyCodeLength = settings.verifyCodeLength;
type SendCodeArgumentType = {
    mobile: string,
    type: 'register' | 'receivePassword'
} & UserSubmitData;
// export class SMSController extends BaseController {

function verifyCode(smsId: string, code: string): Promise<boolean> {
    return new Promise((reslove, reject) => {

    });
}
function test() {
    sendMobileMessage('18502146746', '');
}

function sendMobileMessage(mobile: string, content: string): Promise<string> {
    if (mobile == null)
        return Promise.reject<any>(Errors.argumentNull('mobile'));
    if (content == null)
        return Promise.reject<any>(Errors.argumentNull('content'));

    return new Promise<string>((reslove, rejct) => {
        //'欢迎关注零食有约，您的验证码是1234【零食有约】';
        let data = querystring.stringify({
            userid: '',
            account: 'jk001',
            password: 'jk5543',
            mobile: mobile,
            content: content,
            action: 'send'
        });
        let headers = {
            "Content-Type": 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
        let request = http.request({
            host: 'sh2.ipyy.com',
            path: '/sms.aspx',
            method: 'post',
            headers
        }, (response) => {
            let content_length = new Number(response.headers['content-length']).valueOf();
            let data = response.read(content_length);
            response.on('data', (e) => {
                //TODO:根返回的内容处理错误
                let msg = new Buffer(e).toString();
                reslove(msg);
            });
            response.on('error', (e) => {
                rejct(e);
            })
        });
        request.write(data);
        request.end();
    });
}
// }