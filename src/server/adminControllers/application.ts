import * as data from '../database';
import * as errors from '../errors';
import { ObjectID } from 'mongodb';
import { Appliation, Token, DataContext, Table } from '../database';
import { Controller } from '../common';
import * as settings from '../settings';

type ChangeArguments = { app: Appliation };

export default class AppliationController extends Controller {
    async list() {
        let db = await data.SystemDatabase.createInstance();
        let apps = await db.applications.find({});
        db.close();
        return apps;
    }

    async save({ app }: ChangeArguments) {
        if (app._id) {
            return this.update({ app });
        }

        return this.add({ app });
    }

    async update({ app }: { app: data.Appliation }) {
        if (app == null)
            return errors.argumentNull('app');

        if (app._id == null)
            return errors.fieldNull('_id', 'app');

        let db = await data.SystemDatabase.createInstance();
        let item = await db.applications.findOne({ name: app.name });
        let error = await db.applications.updateItem(app);
        db.close();
        return error;
    }

    async add({ app }: { app: data.Appliation }): Promise<Appliation> {
        if (!app) throw errors.argumentNull('app');
        if (!app.name) throw errors.fieldNull('name', 'app');

        let db = await data.SystemDatabase.createInstance();
        let item = await db.applications.findOne({ name: app.name });
        if (item != null) {
            db.close();
            throw errors.applicationExists(app.name);
        }
        item._id = new ObjectID();//.toHexString();
        let tokenObject = await Token.create(item._id.toHexString(), 'app');
        item.token = tokenObject._id.toHexString();

        let result = await db.applications.insertOne(app);
        db.close();
        return result;
    }

    async newToken({ appId }) {
        if (!appId) throw errors.argumentNull('appId');
        let db = await data.SystemDatabase.createInstance();
        let tokenObject = await Token.create(appId, 'app');
        db.applications.updateItem(<any>{ _id: new ObjectID(appId), token: tokenObject._id.toString() })
            .then(() => db.close())
            .catch(() => db.close());

        return { token: tokenObject._id };
    }

    async get({ appId }) {
        let item = await DataContext.execute(settings.conn.auth, 'Appliation', (table: Table<Appliation>) => {
            return table.findOne({ _id: new ObjectID(appId) });
        })

        return item;
    }
}


