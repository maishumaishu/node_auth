import * as mongodb from 'mongodb';
import { BaseController } from './baseController'
import * as errors from '../errors';
import * as data from '../database';

export class ApplicationController extends BaseController {
    async add(app: data.Appliation): Promise<Error> {
        if (!app) throw errors.argumentNull('app');
        if (!app.name) throw errors.fieldNull('name', 'app');

        let db = await data.SystemDatabase.createInstance();
        let item = await db.applications.findOne({ name: app.name });
        if (item != null) {
            return errors.applicationExists(app.name);
        }
        await db.applications.insertOne(app);
        return errors.success();
    }
    async delete({id}): Promise<Error> {
        if (id == null)
            return errors.argumentNull('id');

        let db = await data.SystemDatabase.createInstance();
        await db.applications.deleteOne({ _id: id });
        return errors.success();
    }
    async list(): Promise<Array<data.Appliation>> {
        let db = await data.SystemDatabase.createInstance();
        let apps = await db.applications.find({});
        return apps;
    }
    async update(app: data.Appliation) {
        if (app == null)
            return errors.argumentNull('app');

        if (app._id == null)
            return errors.fieldNull('_id', 'app');

        let db = await data.SystemDatabase.createInstance();
        let item = await db.applications.findOne({ name: app.name });
        let error = await db.applications.updateOne(app);
        return error;
    }
    async save(app: data.Appliation) {
        if (app._id) {
            return this.update(app);
        }

        return this.add(app);
    }

>>>>>>> 2708b539c3635a7e38c401066800fbcf1056c7ab
}