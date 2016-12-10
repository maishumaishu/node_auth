import * as data from '../database';
import * as errors from '../errors';
import { ObjectID } from 'mongodb';
import { Appliation, Token } from '../database';


export async function list() {
    let db = await data.SystemDatabase.createInstance();
    let apps = await db.applications.find({});
    return apps;
}

type ChangeArguments = { app: Appliation };
export async function save({ app }: ChangeArguments) {
    if (app._id) {
        return update({ app });
    }

    return add({ app });
}

async function update({app}: { app: data.Appliation }) {
    if (app == null)
        return errors.argumentNull('app');

    if (app._id == null)
        return errors.fieldNull('_id', 'app');

    let db = await data.SystemDatabase.createInstance();
    let item = await db.applications.findOne({ name: app.name });
    let error = await db.applications.updateOne(app);
    return error;
}

async function add({app}: { app: data.Appliation }): Promise<Appliation> {
    if (!app) throw errors.argumentNull('app');
    if (!app.name) throw errors.fieldNull('name', 'app');

    let db = await data.SystemDatabase.createInstance();
    let item = await db.applications.findOne({ name: app.name });
    if (item != null) {
        throw errors.applicationExists(app.name);
    }
    item._id = new ObjectID().toHexString();
    let tokenObject = await Token.create(item._id, 'app');
    item.token = tokenObject._id;

    return db.applications.insertOne(app);
}

export async function newToken({appId}) {
    if (!appId) throw errors.argumentNull('appId');
    let db = await data.SystemDatabase.createInstance();
    let tokenObject = await Token.create(appId, 'app');
    db.applications.updateOne(<any>{ _id: new ObjectID(appId), token: tokenObject._id.toString() });
    return { token: tokenObject._id };
}
