import { DataContext, tableNames, appConn } from '../database';
import { Controller } from '../common';
import { conn, pageSize } from '../settings';
import * as errors from '../errors';
export default class AdminUserController extends Controller {
    async list({ pageIndex, appId }) {
        if (!appId)
            throw errors.argumentNull('appId');

        if (pageIndex == null)
            pageIndex = 0;

        var p1 = DataContext.execute(appConn(appId), tableNames.User, (table) => {
            let items = [];
            return new Promise((resolve, reject) => {
                var c = table.source.find().sort({ createDateTime: -1 })
                    .skip(pageSize * pageIndex).limit(pageSize);

                c.toArray((err, results) => {
                    if (err)
                        reject(err);
                    else
                        resolve(results);
                });
            });
        });

        let p2 = DataContext.execute(conn.auth, tableNames.User, (table) => {
            return new Promise((resolve, reject) => {
                table.source.count((err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            })
        });

        let result = await Promise.all([p1, p2]);
        return {
            dataItems: result[0],
            totalRowCount: result[1]
        }
    }
}