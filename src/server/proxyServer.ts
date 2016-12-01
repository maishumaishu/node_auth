
import * as http from 'http';
import * as https from 'https';
import { SystemDatabase, Token } from './database';
import * as Errors from './errors';
import * as url from 'url';
import * as mongodb from 'mongodb';

const APPLICATION_ID = 'application-id';
const APPLICATION_TOKEN = 'application-token';
const USER_ID = 'user-id';
const USER_TOKEN = 'user-token';
export class ProxyServer {
    private server: http.Server;
    private port: number;
    private allowHeaders = 'application-id,application-token,user-token';

    constructor(params: { port: number }) {
        //TODO:判断参数
        this.createServer();
        this.port = params.port;
    }

    private async getRedirectInfo(applicationId: string): Promise<{ host: string, path: string, port: number }> {
        let db = await SystemDatabase.createInstance();
        let application = await db.applications.findOne({ _id: new mongodb.ObjectID(applicationId) });
        if (!application) {
            let err = Errors.objectNotExistWithId(applicationId, 'Application');
            return Promise.reject<any>(err);
        }

        let u = url.parse(application.targetUrl);
        return { host: u.hostname, path: u.path, port: new Number(u.port).valueOf() };
    }

    //=========================================================
    // TODO:加密解密 USER_TOKEN
    private tryParseUserToken(req: http.IncomingMessage): string {
        let userToken = req.headers[USER_TOKEN];
        return userToken;
    }

    private tryParseAppToken(req: http.ServerRequest) {
        let appToken = req.headers[APPLICATION_TOKEN];
        //Token.parse(appToken);
        return appToken;
    }
    //=========================================================

    private async attachHeaderInfo(req: http.IncomingMessage): Promise<{ userId: string, applicationId: string }> {
        let u = url.parse(req.url, true);
        let applicationId = u.query['appId']; //req.headers[APPLICATION_ID];
        if (!applicationId) {
            let err = Errors.canntGetQueryStringFromRequest(APPLICATION_ID);
            return Promise.reject<any>(err);
        }

        let applicationToken = u.query['appToken'];
        if (!applicationToken) {
            let err = Errors.canntGetQueryStringFromRequest(APPLICATION_TOKEN);
            return Promise.reject<any>(err);
        }

        req.headers[APPLICATION_ID] = applicationId;
        let userId: string;
        let userTokenString = u.query['userToken'];
        if (userTokenString != null) {
            let userToken = await Token.parse(applicationId, userTokenString);
            userId = userToken.objectId;
            req.headers[USER_ID] = userId;
        }


        return Promise.resolve({ applicationId, userId });
    }

    private async request(req: http.ServerRequest, res: http.ServerResponse, data?: string | Uint8Array) {
        try {
            let { applicationId } = await this.attachHeaderInfo(req);
            let { host, path, port } = await this.getRedirectInfo(applicationId);

            let headers: any = req.headers;
            headers.host = host;

            let baseUrl = path;
            let requestUrl = this.combinePaths(baseUrl, req.url);
            let request = http.request(
                {
                    host: host,
                    path: requestUrl,
                    method: req.method,
                    headers: headers,
                    port: port
                },
                (response) => {
                    console.assert(response != null);
                    for (var key in response.headers) {
                        res.setHeader(key, response.headers[key]);
                    }
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    // res.setHeader('Access-Control-Allow-Headers', this.allowHeaders);
                    response.pipe(res);
                }
            );

            if (data) {
                //let text = String.fromCharCode.apply(null, data);
                request.write(data);
            }

            request.end();
        }
        catch (err) {
            this.outputError(res, err);
        }
    }

    private outputError(res: http.ServerResponse, err: Error) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', this.allowHeaders);
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.write(JSON.stringify({ name: err.name, message: err.message, stack: err.stack }));
        res.end();
    }

    private createServer() {
        this.server = http.createServer((req: http.ServerRequest, res) => {
            if (req.method == 'POST') {
                req.on('data', (data) => {
                    this.request(req, res, data);
                });
            }
            else {
                // let data: string;
                // let queryStringIndex = req.url.indexOf('?');
                // if (queryStringIndex >= 0) {
                //     data = req.url.substr(queryStringIndex + 1);
                // }
                this.request(req, res);
            }

        });
        return this.server;
    }
    start() {
        this.server.listen(this.port);
    }

    private combinePaths(path1: string, path2: string) {
        console.assert(path1 != null && path2 != null);
        if (!path1.endsWith('/')) {
            path1 = path1 + '/';
        }

        if (path2[0] == '/') {
            path2 = path2.substr(1);
        }

        return path1 + path2;
    }

}