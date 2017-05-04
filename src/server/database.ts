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
    Token: 'Token',
    Application: 'Appliation',
    VerifyMessage: 'VerifyMessage'
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

        return new Promise<T>(async (reslove, reject) => {
            let db = await MongoClient.connect(connectionString);
            var table = new Table<T>(db, tableName);
            try {
                let data = await action(table);
                reslove(data);
            }
            finally {
                db.close();
            }

            return;
        })
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

// export class ApplicationDatabase {
//     private source: mongodb.Db;
//     private _users: Users;
//     private _applications: Table<Appliation>;
//     private _verifyMessages: Table<VerifyMessage>;

//     constructor(source: mongodb.Db) {

//         this.source = source;
//         this._users = new Users(source);
//         this._applications = new Table<Appliation>(source, 'Appliation');
//         this._verifyMessages = new Table<VerifyMessage>(source, 'VerifyMessage');
//     }

//     static async createInstance(appId: string) {
//         return new Promise<ApplicationDatabase>((reslove, reject) => {
//             let connectionString = appConn(appId); //`mongodb://${settings.monogoHost}/${appId}`;
//             MongoClient.connect(connectionString, (err, db) => {
//                 if (err != null) {
//                     reject(err);
//                     return;
//                 }

//                 let instance = new ApplicationDatabase(db);
//                 reslove(instance);
//             })
//         });
//     }

//     get users() {
//         return this._users;
//     }

//     get verifyMessages(): Table<VerifyMessage> {
//         return this._verifyMessages;
//     }

//     close() {
//         console.assert(this.source != null);
//         this.source.close();
//     }
// }

export async function execute(connectionString: string, tableName: string, callback: (collection: mongodb.Collection) => Promise<any>) {
    if (!connectionString) return Promise.reject(errors.argumentNull('connectionString'));
    if (!tableName) return Promise.reject(errors.argumentNull('tableName'));
    if (!callback) return Promise.reject(errors.argumentNull('callback'));

    let db = await MongoClient.connect(connectionString);
    let collection = db.collection(tableName);
    try {
        let result = await callback(collection)
        return result;
    }
    finally {
        db.close();
    }

}

export async function createDB(connectionString: string, callback: (db: mongodb.Db) => Promise<any>) {
    if (!connectionString) return Promise.reject(errors.argumentNull('connectionString'));
    if (!callback) return Promise.reject(errors.argumentNull('callback'));

    let db = await MongoClient.connect(connectionString);

    try {
        let result = await callback(db)
        return result;
    }
    finally {
        db.close();
    }
}

export class Database {
    private source: mongodb.Db;
    private _applications: Table<Application>;
    private _tokens: Table<Token>;
    private _users: Table<User>;
    private _verifyMessages: Table<VerifyMessage>;

    constructor(source: mongodb.Db) {
        this.source = source;
        this._applications = new Table<Application>(source, 'Appliation');
        this._tokens = new Table<Token>(source, tableNames.Token);// 'Token');
    }

    static async createInstance() {
        return new Promise<Database>((reslove, reject) => {
            let connectionString = settings.conn.auth; //`mongodb://${settings.monogoHost}/node_auth`;
            MongoClient.connect(connectionString, (err, db) => {
                if (err != null) {
                    reject(err);
                    return;
                }

                let instance = new Database(db);
                reslove(instance);
            })
        })
    }

    get applications(): Table<Application> {
        return this._applications;
    }

    get tokens(): Table<Token> {
        return this._tokens;
    }

    get users(): Table<User> {
        return this._users;
    }

    get verifyMessages(): Table<VerifyMessage> {
        return this._verifyMessages;
    }

    static async application(id: string): Promise<Application> {
        if (!id) throw errors.argumentNull('id');

        return execute(settings.conn.auth, tableNames.Application, async (collection) => {
            let item = await collection.findOne({ _id: new mongodb.ObjectID(id) });
            return item;
        })
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
    applicationId: mongodb.ObjectID,
}

export interface Application extends Entity {
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
    verifyCode: string,
    applicationId: mongodb.ObjectID
}

/**
 * 用于解释和生成 token 。
 */
export class Token implements Entity {
    _id?: mongodb.ObjectID;
    objectId: string;
    type: string;
    createDateTime: Date;

    static async create(objectId: string, type: 'user' | 'app'): Promise<Token> {
        let token = new Token();
        token.objectId = objectId;
        token.type = type;

        token._id = new mongodb.ObjectID();
        token.createDateTime = new Date(Date.now());

        return execute(settings.conn.auth, tableNames.Token, async (collection) => {
            await collection.insert(token);
            return token;
        });

    }

    /**
     * 对令牌字符串进行解释，转换为令牌对象
     * @param appId 应用ID
     * @tokenValue 令牌字符串
     */
    static async parse(tokenValue: string): Promise<Token> {
        if (!tokenValue)
            return Promise.reject(errors.argumentNull('tokenValue'));

        if (tokenValue.length != 24)
            return Promise.reject(errors.invalidObjectId(tokenValue));

        // return DataContext.execute<Token>(settings.conn.auth, tableNames.Token, (table: Table<Token>) => {
        //     return table.findOne({ _id: new mongodb.ObjectID(tokenValue) });
        // })

        return execute(settings.conn.auth, tableNames.Token, async (collection) => {
            var token = await collection.findOne({ _id: new mongodb.ObjectID(tokenValue) }) as any;
            if (token == null)
                throw errors.objectNotExistWithId(tokenValue, tableNames.Token);

            return token as Token;
        })

    }
}
