/// <reference path="typings/mongodb/mongodb-1.4.9.d.ts" />
import * as mongodb from 'mongodb';
import * as tokenParser from './tokenParser';
import * as settings from './settings';
import { Errors } from './Errors';

let MongoClient = mongodb.MongoClient;

export class Table<T extends Entity>{
    private source: mongodb.Collection;
    constructor(db: mongodb.Db, name: string) {
        this.source = db.collection(name);
    }
    insert(entity: T): Promise<any> {
        return new Promise((reslove, reject) => {
            if (entity.id == null)
                entity.id = guid();

            if (entity.createDateTime == null)
                entity.createDateTime = new Date(Date.now());

            this.source.insert(entity, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                reslove(result);
            });
        });
    }
    update(entity: T) {
        if (entity.id == null) {
            throw Errors.fieldNull('id', 'User');
        }
        this.source.update(`id='${entity.id}'`, entity);
    }
    delete(id: string) {
        if (id == null) {
            throw Errors.argumentNull('id');
        }
        this.source.deleteOne(`id='${id}'`);
    }
    find(filter: string) {
        return this.source.find(filter);
    }
    findOne(selector) {
        return new Promise((reslove, reject) => {
            this.source.findOne(selector, (err: Error, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                reslove(result);
            });
        });
    }
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

export class Database {
    private source: mongodb.Db;
    private _users: Users;

    constructor(source: mongodb.Db) {
        this.source = source;
        this._users = new Users(source);
    }

    static async createInstance(appId: string) {
        return new Promise<Database>((reslove, reject) => {
            let connectionString = `mongodb://${settings.monogoHost}/${appId}`;
            MongoClient.connect(connectionString, (err, db) => {
                if (err != null && reject != null) {
                    reject(err);
                }

                let instance = new Database(db);
                reslove(instance);
            })
        });
    }

    get users(): Users {
        return this._users;
    }

    close() {
        this.source.close();
    }
}

export class Users extends Table<User> {
    constructor(db: mongodb.Db) {
        super(db, 'User');
    }
}

export interface Entity {
    id?: string,
    createDateTime?: Date,
}

export interface User extends Entity {
    username: string,
    password: string,
    group?: string
}

export interface Appliation extends Entity {
    name: string
}
