import * as http from 'http';
import * as https from 'https';

export class ProxyServer {
    private server: http.Server;
    private port: number;
    private proxyHost: string;
    private baseUrl: string;

    constructor(params: { port: number, targetHost: string, baseUrl: string }) {
        //TODO:判断参数
        this.createServer();
        this.port = params.port;
        this.proxyHost = params.targetHost;
        this.baseUrl = params.baseUrl;
    }


    private request(req: http.IncomingMessage, res: http.ServerResponse, data?: string) {
        let host = this.proxyHost;

        let headers: any = req.headers;
        headers.host = host;

        if (data) {
            headers['Content-Length'] = data.length;
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }

        let requestUrl = this.baseUrl + req.url;
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
                response.pipe(res);
            }
        );

        if (data)
            request.write(data);

        request.end();
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