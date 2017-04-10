import { DataContext, tableNames, execute } from '../database';
import { Controller } from '../common';
import { conn, pageSize } from '../settings';
import * as errors from '../errors';
export default class AdminUserController extends Controller {
    async list({ pageIndex, appId }) {
        if (!appId)
            throw errors.argumentNull('appId');

        if (pageIndex == null)
            pageIndex = 0;

        var p1 = execute(conn.auth, tableNames.User, (collection) => {
            var cursor = collection.find().sort({ createDateTime: -1 });
            return cursor.toArray();
        });

        let p2 = execute(conn.auth, tableNames.User, async (collection) => {
            // return new Promise((resolve, reject) => {
            var c = await collection.count();
            return c;
        });

        let result = await Promise.all([p1, p2]);
        return {
            dataItems: result[0],
            totalRowCount: result[1]
        }
    }
}