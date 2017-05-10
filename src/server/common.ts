import { Request } from 'express';
import { ObjectID, Db, MongoClient } from 'mongodb';
import * as errors from './errors'

export interface UserSubmitData {
    appId: string,
    appToken: string,
    userId?: string,
    userToken?: string
}

export interface AppRequest extends Request {
    postData: UserSubmitData
}

export class Controller {
    databaseInstances: Array<Db>;
    constructor() {
        this.databaseInstances = [];
    }

    async createDatabaseInstance(connectionString: string): Promise<Db> {
        if (!connectionString) return Promise.reject(errors.argumentNull('connectionString'));
        let db = await MongoClient.connect(connectionString);
        this.databaseInstances.push(db);
        return db;
    }
}

export class UserController extends Controller {
    appId: ObjectID;
    userId: ObjectID;
}

// export class AdminController extends Controller {

// }