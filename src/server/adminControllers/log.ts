import { DataContext, tableNames } from '../database';
import { Controller } from '../common';
import { conn, pageSize } from '../settings';
export default class LogController extends Controller {
    async redirectlist({ pageIndex }) {
        if (pageIndex == null)
            pageIndex = 0;

        var p1 = DataContext.execute(conn.log, tableNames.RedirectLog, (table) => {
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

        let p2 = DataContext.execute(conn.log, tableNames.RedirectLog, (table) => {
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

    async userRequestlist({ pageIndex }) {
        if (pageIndex == null)
            pageIndex = 0;

        var p1 = DataContext.execute(conn.log, tableNames.RequestLog, (table) => {
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

        let p2 = DataContext.execute(conn.log, tableNames.RequestLog, (table) => {
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