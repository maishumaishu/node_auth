import * as data from '../database';
import * as errors from '../errors';

export async function list() {
    let db = await data.SystemDatabase.createInstance();
    let apps = await db.applications.find({});
    return apps;
}
export async function save(app: data.Appliation) {
    if (app._id) {
        return this.update(app);
    }

    return this.add(app);
}
export async function update(app: data.Appliation) {
    if (app == null)
        return errors.argumentNull('app');

    if (app._id == null)
        return errors.fieldNull('_id', 'app');

    let db = await data.SystemDatabase.createInstance();
    let item = await db.applications.findOne({ name: app.name });
    let error = await db.applications.updateOne(app);
    return error;
}
export async function add(app: data.Appliation): Promise<Error> {
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
