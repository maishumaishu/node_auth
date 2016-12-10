import { Request } from 'express';

export interface UserSubmitData {
    appId: string,
    appToken: string,
    userId?: string,
    userToken?: string
}

export interface AppRequest extends Request {
    postData: UserSubmitData
}