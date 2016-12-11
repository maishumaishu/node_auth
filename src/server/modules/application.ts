import * as data from '../database';
import * as errors from '../errors';
import { ObjectID } from 'mongodb';
import { Appliation, Token } from '../database';
import { Controller } from '../common';

type ChangeArguments = { app: Appliation };

export default class AppliationController extends Controller {
    async  list() {
        let db = await data.SystemDatabase.createInstance();
        let apps = await db.applications.find({});
        return apps;
    }

    async  save({ app }: ChangeArguments) {
        if (app._id) {
            return this.update({ app });
        }

        return this.add({ app });
    }

    async update({app}: { app: data.Appliation }) {
        if (app == null)
            return errors.argumentNull('app');

        if (app._id == null)
            return errors.fieldNull('_id', 'app');

        let db = await data.SystemDatabase.createInstance();
        let item = await db.applications.findOne({ name: app.name });
        let error = await db.applications.updateOne(app);
        return error;
    }

    async  add({app}: { app: data.Appliation }): Promise<Appliation> {
        if (!app) throw errors.argumentNull('app');
        if (!app.name) throw errors.fieldNull('name', 'app');

        let db = await data.SystemDatabase.createInstance();
        let item = await db.applications.findOne({ name: app.name });
        if (item != null) {
            throw errors.applicationExists(app.name);
        }
        item._id = new ObjectID();//.toHexString();
        let tokenObject = await Token.create(item._id.toHexString(), 'app');
        item.token = tokenObject._id.toHexString();

        return db.applications.insertOne(app);
    }

    async newToken({appId}) {
        if (!appId) throw errors.argumentNull('appId');
        let db = await data.SystemDatabase.createInstance();
        let tokenObject = await Token.create(appId, 'app');
        db.applications.updateOne(<any>{ _id: new ObjectID(appId), token: tokenObject._id.toString() });
        return { token: tokenObject._id };
    }
}


