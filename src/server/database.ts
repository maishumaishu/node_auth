import * as mongodb from 'mongodb';
import * as settings from './settings';
import * as errors from './errors';

let MongoClient = mongodb.MongoClient;


export const tableNames = {
    Token: 'Token',
    RedirectLog: 'RedirectLog',
    RequestLog: 'RequestLog',
}

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

export async function execute<T>(connectionString: string, tableName: string, callback: (collection: mongodb.Collection) => Promise<T>): Promise<T> {
    if (!connectionString) return Promise.reject(errors.argumentNull('connectionString'));
    if (!tableName) return Promise.reject(errors.argumentNull('tableName'));
    if (!callback) return Promise.reject(errors.argumentNull('callback'));

    let db;
    try {
        db = await MongoClient.connect(connectionString);
        let collection = db.collection(tableName);
        let result = await callback(collection)
        return result;
    }
    finally {
        if (db)
            db.close();
    }

}

/**
 * 用于解释和生成 token 。
 */
export class Token {
    _id?: mongodb.ObjectID;
    // objectId: mongodb.ObjectID;
    // type: string;
    content: string;
    contentType: string;
    createDateTime: Date;

    static async create(content: string, contentType: string): Promise<Token> {
        let token = new Token();

        token._id = new mongodb.ObjectID();
        token.content = content;
        token.contentType = contentType;
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

        // throwException == throwException == null ? true : throwException;

        if (!tokenValue)
            return Promise.reject(errors.argumentNull('tokenValue'));

        if (tokenValue.length != 24)
            return Promise.reject(errors.invalidObjectId(tokenValue));

        return execute(settings.conn.auth, tableNames.Token, async (collection) => {
            var token = await collection.findOne({ _id: new mongodb.ObjectID(tokenValue) }) as any;
            return token as Token;
        })

    }
}
