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
        return update(app);
    }

    return add(app);
}

async function update(app: data.Appliation) {
    if (app == null)
        return errors.argumentNull('app');

    if (app._id == null)
        return errors.fieldNull('_id', 'app');

    let db = await data.SystemDatabase.createInstance();
    let item = await db.applications.findOne({ name: app.name });
    let error = await db.applications.updateOne(app);
    return error;
}

async function add(app: data.Appliation): Promise<Appliation> {
    if (!app) throw errors.argumentNull('app');
    if (!app.name) throw errors.fieldNull('name', 'app');

    let db = await data.SystemDatabase.createInstance();
    let item = await db.applications.findOne({ name: app.name });
    if (item != null) {
        throw errors.applicationExists(app.name);
    }
    return db.applications.insertOne(app);
}
