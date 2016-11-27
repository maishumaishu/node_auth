import * as http from 'http';
import * as express from 'express';
import * as errors from '../errors';
import * as  controller from '../modules/application';

let app = express();

app.get('/application/list', async function (req, res, next) {
    let result = await controller.list();
    next(result);
});

app.post('/application/save', async function (req, res, next) {
    let postData = await getPostObject(req);
    let result = await controller.save(postData);
    next(result);
});

// app.options('/*', function (req, res) {
//     res.send(JSON.stringify({}));
// });

function getPostObject(request: http.IncomingMessage): Promise<any> {
    let method = (request.method || '').toLowerCase();
    let length = request.headers['content-length'] || 0;
    if (length <= 0)
        return Promise.resolve({});

    return new Promise((reslove, reject) => {
        request.on('data', (data: { toString: () => string }) => {
            try {
                let obj;
                obj = JSON.parse(data.toString())
                reslove(obj);
            }
            catch (exc) {
                reject(exc);
            }
        });
    });
}

export = app;