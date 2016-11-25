
import * as http from 'http';
import * as https from 'https';
import { SystemDatabase } from './database';
import * as Errors from './errors';
import * as url from 'url';

export class ProxyServer {
    private server: http.Server;
    private port: number;
    //private proxyHost: string;
    //private baseUrl: string;
    //private db:SystemDatabase;

    constructor(params: { port: number }) {
        //TODO:判断参数
        this.createServer();
        this.port = params.port;
        //this.proxyHost = params.targetHost;
        //this.baseUrl = params.baseUrl;
    }


    private async request(req: http.IncomingMessage, res: http.ServerResponse, data?: string | Uint8Array) {

        let headers: any = req.headers;

        let applicationId = req.headers['application-id'];
        if (!applicationId) {
            let err = Errors.canntGetAppIdFromHeader();
            this.outputError(res, err);
            return;
        }

        let db = await SystemDatabase.createInstance();
        let application = await db.applications.findOne({ guid: applicationId });
        let u = url.parse(application.targetUrl);
        let host = u.host;

        headers.host = host;

        if (application == null) {
            let err = Errors.applicationExistsWithGuid(applicationId);
            this.outputError(res, err);
            return;;
        }

        let baseUrl = u.path;
        let requestUrl = baseUrl + req.url;
        let request = http.request(
            {
                host: host,
                path: requestUrl,
                method: req.method,
                headers: headers,
            },
            (response) => {
                for (var key in response.headers) {
                    res.setHeader(key, response.headers[key]);
                }
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Headers', 'Application-Id');
                response.pipe(res);
            }
        );

        if (data) {
            let text = String.fromCharCode.apply(null, data);
            request.write(data);
        }

        request.end();
    }

    private outputError(res: http.ServerResponse, err: Error) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Application-Id');
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.write(JSON.stringify({ name: err.name, message: err.message, stack: err.stack }));
        res.end();
    }



    private createServer() {
        this.server = http.createServer((req, res) => {

            let appToken = req.headers['appToken'];


            if (req.method == 'POST') {
                req.on('data', (data) => {
                    this.request(req, res, data);
                });
            }
            else {
                let data: string;
                let queryStringIndex = req.url.indexOf('?');
                if (queryStringIndex >= 0) {
                    data = req.url.substr(queryStringIndex + 1);
                }
                this.request(req, res, data);
            }

        });
        return this.server;
    }
    start() {
        this.server.listen(this.port);
    }

}