import * as data from '../database';
import * as errors from '../errors';
import { ObjectID } from 'mongodb';
import { Application, Token, DataContext, Table, tableNames, execute } from '../database';
import { Controller } from '../common';
import * as settings from '../settings';

type ChangeArguments = { app: Application };

export default class AppliationController extends Controller {
    async list() {
        return execute(settings.conn.auth, tableNames.Application, async (collection) => {
            let cursor = collection.find();
            console.assert(cursor != null);
            let items = await cursor.toArray();
            return items;
        });
    }

    async save({ app }: ChangeArguments) {
        if (app._id) {
            return this.update({ app });
        }

        return this.add({ app });
    }

    async update({ app }: { app: data.Application }) {
        if (app == null)
            throw errors.argumentNull('app');

        if (app._id == null)
            throw errors.fieldNull('_id', 'app');

        return DataContext.execute(settings.conn.auth, tableNames.Application, (collection) => {
            return collection.updateItem(app);
        });

    }

    async add({ app }: { app: data.Application }): Promise<Application> {
        if (!app) throw errors.argumentNull('app');
        if (!app.name) throw errors.fieldNull('name', 'app');
        let db = await this.createDatabaseInstance(settings.conn.auth);
        // return DataContext.execute(settings.conn.auth, tableNames.Application, async function (table) {
        let table = db.collection(tableNames.Application);
        let item: Application = await table.findOne<Application>({ name: app.name });
        if (item != null) {
            return Promise.reject(errors.applicationExists(app.name));
        }

        // item = {} as Application;
        app._id = new ObjectID();
        // app.name = app.name;
        let tokenObject = await Token.create(app._id, 'app');
        app.token = tokenObject._id.toHexString();
        await table.insertOne(app);
        return app;
        // });
    }

    async newToken({ appId }) {
        if (!appId) throw errors.argumentNull('appId');
        let db = await data.Database.createInstance();
        let tokenObject = await Token.create(appId, 'app');
        db.applications.updateItem(<any>{ _id: new ObjectID(appId), token: tokenObject._id.toString() })
            .then(() => db.close())
            .catch(() => db.close());

        return { token: tokenObject._id };
    }

    async get({ appId }) {
        let item = await execute(settings.conn.auth, tableNames.Application, async (collection) => {
            let item = await collection.findOne({ _id: new ObjectID(appId) });
            return item;
        })

        return item;
    }
}


