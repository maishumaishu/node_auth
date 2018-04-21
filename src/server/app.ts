import * as http from 'http';
import * as errors from './errors';
import * as url from 'url';
import * as settings from './settings';
import { debug } from 'util';
import { Token } from './token';

let server = http.createServer((req, res) => {
    serverCallback(req, res)
        .catch(err => {
            outputError(res, err);
        });
});

server.listen(settings.port, settings.bindIP);
async function serverCallback(req: http.IncomingMessage, res: http.ServerResponse) {
    console.assert(req.method != null);
    setHeaders(res);
    if (req.method.toLowerCase() == 'options') {
        res.statusCode = 204;
        res.end();
        return;
    }
    let token: Token = null;
    let tokenText = req.headers['token'] as string;
    if (typeof tokenText == "object") {
        tokenText = tokenText[0];
    }

    if (tokenText) {
        token = await Token.parse(tokenText);
    }

    let { host, path, port } = await getRedirectInfo(req)
    let headers: any = req.headers;
    if (token != null && (token.contentType || '').indexOf('json') > 0) {
        var obj = JSON.parse(token.content);
        for (let key in obj) {
            headers[key] = obj[key];
        }
    }

    let request = http.request(
        {
            host: host,
            path: path,
            method: req.method,
            headers: headers,
            port: port
        },
        (response) => {
            console.assert(response != null);

            const StatusCodeGenerateToken = 666; // 生成 Token
            if (response.statusCode == StatusCodeGenerateToken) {
                let responseContent: string;
                let contentType = response.headers['content-type'] as string;
                response.on('data', (data: ArrayBuffer) => {
                    responseContent = data.toString();
                })
                response.on('end', () => {
                    Token.create(responseContent, contentType)
                        .then((o: Token) => {
                            res.setHeader("content-type", "application/json");
                            var obj = JSON.stringify({ token: o._id });
                            res.write(obj);
                            res.end();
                        }).catch(err => {
                            outputError(res, err);
                        })
                })
            }
            else {
                for (var key in response.headers) {
                    res.setHeader(key, response.headers[key]);
                }
                res.statusCode = response.statusCode;
                res.statusMessage = response.statusMessage
                response.pipe(res);
            }
        },
    );

    request.on('error', function (err) {
        outputError(res, err);
    })

    let contentLength = 0;
    if (req.headers['content-length']) {
        contentLength = new Number(req.headers['content-length']).valueOf();
    }

    req.on('data', (data) => {
        request.write(data);
    })
    req.on('end', (data) => {
        request.end();
    })
}

function outputError(response: http.ServerResponse, err: Error) {
    console.assert(err != null, 'error is null');

    const StatusCodeDefaultError = 600;

    response.statusCode = StatusCodeDefaultError;
    response.statusMessage = err.name;      // statusMessage 不能为中文，否则会出现 invalid chartset 的异常

    if (/^\d\d\d\s/.test(err.name)) {
        response.statusCode = Number.parseInt(err.name.substr(0, 3));
        err.name = err.name.substr(4);
    }

    let outputObject = { message: err.message, name: err.name, stack: err.stack };
    let str = JSON.stringify(outputObject);
    response.write(str);
    response.end();
}



function setHeaders(res: http.ServerResponse) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    // res.setHeader('Access-Control-Allow-Headers', settings.allowHeaders);
    // res.setHeader('Access-Control-Allow-Methods', `POST, GET, OPTIONS, PUT, DELETE`);
}


type RediectInfo = { host: string, path: string, port: number };
async function getRedirectInfo(req: http.IncomingMessage): Promise<RediectInfo> {

    let redirectInfos = settings.redirectInfos; //application.redirects || [];

    let u1 = url.parse(req.url);
    let arr = u1.path.split('/').filter(o => o);
    let rootDir = arr.shift();      // 获取请求路径的根目录
    let path = arr.join('/');       // 获取相对于根目录的路径

    let redirectInfo = redirectInfos.pathInfos.filter(o => o.rootDir == rootDir)[0];
    if (redirectInfo == null)
        throw errors.canntGetRedirectUrl(rootDir);

    let target = combinePaths(redirectInfo.targetUrl, path);
    let u = url.parse(target);
    return { host: u.hostname, path: u.path, port: new Number(u.port).valueOf() };
}

function combinePaths(path1: string, path2: string) {
    console.assert(path1 != null && path2 != null);
    if (!path1.endsWith('/')) {
        path1 = path1 + '/';
    }

    if (path2[0] == '/') {
        path2 = path2.substr(1);
    }

    return path1 + path2;
}

process.on('unhandledRejection', (reason, p) => {
    debugger;
    console.log(reason);
});


