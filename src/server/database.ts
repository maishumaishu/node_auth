/// <reference path="typings/mongodb/mongodb-1.4.9.d.ts" />
import * as mongodb from 'mongodb';
import * as settings from './settings';
import * as errors from './errors';

let MongoClient = mongodb.MongoClient;

export class Table<T extends Entity>{
    public source: mongodb.Collection;
    constructor(db: mongodb.Db, name: string) {
        if (!db) throw errors.argumentNull('db');
        if (!name) throw errors.argumentNull('name');

        this.source = db.collection(name);
    }
    insertOne(entity: T): Promise<T> {
        if (typeof entity._id == 'string') {
            entity._id = new mongodb.ObjectID(entity._id);
        }
        return new Promise((reslove, reject) => {
            if (entity.createDateTime == null)
                entity.createDateTime = new Date(Date.now());

            let obj: { [name: string]: any } = {};
            for (let key in entity) {
                if (key == '_id') {
                    continue;
                }

                obj[key] = entity[key];
            }

            if (entity._id != null) {
                obj['_id'] = entity._id; //new mongodb.ObjectID(entity._id);
            }

            this.source.insertOne(obj, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                reslove(result.ops[0]);
            });
        });
    }
    updateItem(entity: T): Promise<Error | T> {
        if (typeof entity._id == 'string') {
            entity._id = new mongodb.ObjectID(entity._id);
        }
        return new Promise((reslove, reject) => {
            if (entity == null) {
                reject(errors.argumentNull('entity'));
                return;
            }

            if (entity._id == null) {
                reject(errors.fieldNull('id', 'entity'));
                return;
            }

            let obj: any = {};
            for (let key in entity) {
                if (key == '_id')
                    continue;

                obj[key] = entity[key];
            }

            this.source.updateOne({ _id: entity._id }, { $set: obj }, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (result.matchedCount == 0) {
                    reject(errors.updateResultZero());
                    return;
                }
                reslove(obj);
                return;
            });
        })
    }
    updateOne(filter: Object, update: any) {
        return new Promise((resolve, reject) => {
            this.source.updateOne(filter, update, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        })
    }
    deleteOne(filter: any): Promise<Error> {
        return new Promise((reslove, reject) => {
            return this.source.deleteOne(filter, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                if (result.deletedCount == 0) {
                    reject(errors.deleteResultZero());
                    return;
                }
                reslove(errors.success());
            });
        });
    }
    deleteMany(filter: any) {
        return new Promise((reslove, reject) => {
            return this.source.deleteMany(filter, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                reslove(result);
            });
        });
    }
    find(selector?: Object): Promise<Array<T>> {
        return new Promise((reslove, reject) => {
            this.source.find(selector, (err: Error, result: mongodb.Cursor) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                result.toArray((err, items: Array<T>) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    reslove(items);
                });
            });
        });
    }
    findOne(selector): Promise<T> {
        return new Promise((reslove, reject) => {
            this.source.findOne(selector, (err: Error, result: T) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                reslove(result);
            });
        });
    }
}

export const tableNames = {
    RedirectLog: 'RedirectLog',
    RequestLog: 'RequestLog',
    User: 'User',
}

export class DataContext {
    private db: mongodb.Db;
    private connectionString: string;
    private tables: { [propName: string]: Table<any> };

    constructor(connectionString: string) {
        if (!connectionString)
            throw errors.argumentNull('connectionString');

        this.connectionString = connectionString;
    }

    open() {
        return new Promise((reslove, reject) => {
            MongoClient.connect(this.connectionString, (err, db) => {
                this.db = db;
                if (err)
                    reject(err);
                else {
                    this.db = db;
                    reslove(db);
                }
            })
        });
    }

    close() {
        return new Promise((reslove, reject) => {
            if (!this.db)
                return Promise.resolve();

            this.db.close(true, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    reslove();
                }
            })
        });
    }

    async table<T>(name: string): Promise<Table<T>> {
        if (this.db) {
            await this.open();
        }
        if (this.tables[name] == null) {
            this.tables[name] = new Table<T>(this.db, name);
        }
        return this.tables[name];
    }

    static execute<T>(connectionString: string, tableName: string, action: (table: Table<any>) => Promise<T>) {
        if (!connectionString)
            throw errors.argumentNull('connectionString');
        if (!tableName)
            throw errors.argumentNull('tableName');
        if (action == null)
            throw errors.argumentNull('action');

        return new Promise<T>((reslove, reject) => {
            MongoClient.connect(connectionString, (err, db) => {
                if (err) {
                    reject(err);
                    return;
                }

                var table = new Table<T>(db, tableName);
                let result = action(table);
                if (result == null) {
                    reject();
                    db.close();
                }
                else {
                    result
                        .then((data) => {
                            reslove(data);
                            db.close();
                        })
                        .catch(() => db.close());
                }

                return;
            })
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

export class ApplicationDatabase {
    private source: mongodb.Db;
    private _users: Users;
    private _applications: Table<Appliation>;
    private _verifyMessages: Table<VerifyMessage>;

    constructor(source: mongodb.Db) {

        this.source = source;
        this._users = new Users(source);
        this._applications = new Table<Appliation>(source, 'Appliation');
        this._verifyMessages = new Table<VerifyMessage>(source, 'VerifyMessage');
    }

    static async createInstance(appId: string) {
        return new Promise<ApplicationDatabase>((reslove, reject) => {
            let connectionString = appConn(appId); //`mongodb://${settings.monogoHost}/${appId}`;
            MongoClient.connect(connectionString, { maxPoolSize: 50 }, (err, db) => {
                if (err != null) {
                    reject(err);
                    return;
                }

                let instance = new ApplicationDatabase(db);
                reslove(instance);
            })
        });
    }

    get users() {
        return this._users;
    }

    get verifyMessages(): Table<VerifyMessage> {
        return this._verifyMessages;
    }

    close() {
        console.assert(this.source != null);
        this.source.close();
    }
}

export function appConn(appId: string) {
    let connectionString = `mongodb://${settings.monogoHost}/${appId}`;
    return connectionString;
}

export class SystemDatabase {
    private source: mongodb.Db;
    private _applications: Table<Appliation>;
    private _tokens: Table<Token>;

    constructor(source: mongodb.Db) {
        this.source = source;
        this._applications = new Table<Appliation>(source, 'Appliation');
        this._tokens = new Table<Token>(source, 'Token');
    }

    static async createInstance() {
        return new Promise<SystemDatabase>((reslove, reject) => {
            let connectionString = `mongodb://${settings.monogoHost}/node_auth`;
            MongoClient.connect(connectionString, { maxPoolSize: 50 }, (err, db) => {
                if (err != null) {
                    reject(err);
                    return;
                }

                let instance = new SystemDatabase(db);
                reslove(instance);
            })
        })
    }

    get applications(): Table<Appliation> {
        return this._applications;
    }

    get tokens(): Table<Token> {
        return this._tokens;
    }

    static async application(id: string) {
        let db = await SystemDatabase.createInstance();
        var app = await db.applications.findOne({ _id: new mongodb.ObjectID(id) });
        db.close();
        return app;
    }

    close() {
        console.assert(this.source != null);
        this.source.close(true);
    }
}


export class Users extends Table<User> {
    constructor(db: mongodb.Db) {
        super(db, tableNames.User);
    }
}

export interface Entity {
    _id?: mongodb.ObjectID,
    createDateTime?: Date,
}

export interface User extends Entity {
    username: string,
    password: string,
    group?: string,
    mobile?: string,
    email?: string,
}

export interface Appliation extends Entity {
    name: string,
    /** 默认的转发路径 */
    targetUrl: string,
    /** 即 appkey */
    token: string,
    /** 请求的路径信息 */
    pathInfos: [{
        /** 匹配请求路径的正则表达式 */
        pattern: string,
        /** 请求转发的URL地址 */
        forwardTo: string,
        /** 允许访问的用户组，为空则允许全部 */
        allowGroups: string[]
    }],
    redirects: {
        urlPattern: string,
        target: string,
    }[]

}

/**
 * 验证短信
 */
export interface VerifyMessage extends Entity {
    /** 短信内容 */
    content: string,
    /** 验证码 */
    verifyCode: string
}

/**
 * 用于解释和生成 token 。
 */
export class Token implements Entity {
    _id?: mongodb.ObjectID;
    objectId: string;
    type: string

    static async create(objectId: string, type: 'user' | 'app'): Promise<Token> {
        let token = new Token();
        //token.value = guid();
        token.objectId = objectId;
        token.type = type;

        let db = await SystemDatabase.createInstance();
        token = await db.tokens.insertOne(token);
        db.close();
        return token;
    }

    /**
     * 对令牌字符串进行解释，转换为令牌对象
     * @param appId 应用ID
     * @tokenValue 令牌字符串
     */
    static async parse(tokenValue: string): Promise<Token> {
        let db = await SystemDatabase.createInstance();
        let token = await db.tokens.findOne({ _id: new mongodb.ObjectID(tokenValue) });
        db.close();
        if (token == null) {
            throw errors.invalidToken(tokenValue);
        }
        db.close();
        return token;
    }
}
