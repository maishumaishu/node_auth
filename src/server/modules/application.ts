import * as data from '../database';
import * as errors from '../errors';
import { Appliation } from '../database';

export async function list() {
    let db = await data.SystemDatabase.createInstance();
    let apps = await db.applications.find({});
    return apps;
}

type ChangeArguments = { app: Appliation };
export async function save({ app }: ChangeArguments) {
    if (app._id) {
        return this.update(app);
    }

    return this.add(app);
}

export async function add({ app }: ChangeArguments): Promise<Error> {
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
