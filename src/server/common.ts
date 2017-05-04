import { Request } from 'express';
import { ObjectID } from 'mongodb';

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
    appId: ObjectID;
    userId: ObjectID;
}