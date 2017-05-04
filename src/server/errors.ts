

interface MyError extends Error {
    arguments: any
}

//export class Errors {
export let names = {
    ActionNotExists: 'ActionNotExists',
    ApplicationExists: 'ApplicationExists',
    ApplicationIdRequired: 'ApplicationIdRequired',
    ApplicationTokenRequired: 'ApplicationTokenRequired',
    ArgumentNull: 'ArgumentNull',
    CanntGetHeaderFromRequest: 'CanntGetHeaderFromRequest',
    ControllerNotExist: 'ControllerNotExist',
    DeleteResultZero: 'DeleteResultZero',
    FieldNull: 'FieldNull',
    InvalidToken: 'InvalidToken',
    NotAllowRegister: 'NotAllowRegister',
    NotImplement: 'NotImplement',
    MobileIsBind: 'MobileIsBind',
    ObjectNotExistWithId: 'ObjectNotExistWithId',
    PasswordIncorect: 'PasswordIncorect',
    PostIsRequired: 'PostIsRequired',
    Success: 'Success',
    UserExists: 'UserExists',
    UserNotExists: 'UserNotExists',
    UpdateResultZero: 'UpdateResultZero',
    VerifyCodeIncorrect: 'VerifyCodeIncorrect'
}

export function fieldNull(fieldName: string, objectName: string): Error {
    let msg = `The '${fieldName}' field of '${objectName}' object cannt be null.`;
    let error = new Error(msg);
    error.name = names.FieldNull;
    return error;
}

export function argumentNull(argumentName: string): Error {
    let msg = `Argument '${argumentName}' cannt be null`;
    let error = new Error(msg);
    error.name = names.ArgumentNull;
    return error;
}

export function passwordIncorect(username: string): Error {
    let msg = `Password incorect.`;
    let error = new Error(msg);
    error.name = names.PasswordIncorect;
    return error;
}

export function usernameExists(username: string): Error {
    let msg = `用户名 '${username}' 已被注册`;
    let error = new Error(msg);
    error.name = names.UserExists;
    (<any>error).arguments = { username };
    return error;
}

export function mobileExists(mobile: string): Error {
    let msg = `手机号 '${mobile}' 已被注册`;
    let error = new Error(msg);
    error.name = 'MobileExists';
    (<any>error).arguments = { mobile };
    return error;
}

export function success(): Error {
    let msg = `Success`;
    let error = new Error(msg);
    error.name = names.Success;
    error.stack = undefined;
    return error;
}

export function notAllowRegister(): Error {
    let msg = 'System is config to not allow register.'
    let error = new Error(msg);
    error.name = names.NotAllowRegister;
    return error;
}

export function notImplement(): Error {
    let msg = 'Not implement.';
    let error = new Error(msg);
    error.name = names.NotImplement;
    return error;
}

export function userNotExists(username: string): Error {
    let msg = `User '${username}' is not exists.`
    let error = new Error(msg) as MyError;
    error.name = names.UserNotExists;
    error.arguments = { username };
    return error;
}

export function invalidToken(tokenValue: string): Error {
    let msg = `Token '${tokenValue}' is not a valid token.`;
    let error = new Error(msg) as MyError;
    error.name = names.InvalidToken;
    error.arguments = { token: tokenValue };
    return error;
}

export function applicationExists(name: string): Error {
    let msg = `Application with name '${name}' is exists.`;
    let error = new Error(msg) as MyError;
    error.name = names.ApplicationExists;
    error.arguments = { name };
    return error;
}

export function deleteResultZero(): Error {
    let msg = 'Deleted count is zero, maybe the object is not exists.'
    let error = new Error(msg);
    error.name = names.DeleteResultZero;
    return error;
}

export function updateResultZero(): Error {
    let msg = 'Updated count is zero, maybe the object is not exists.'
    let error = new Error(msg);
    error.name = names.UpdateResultZero;
    return error;
}

export function postIsRequired(): Error {
    let msg = 'Post request is required.';
    let error = new Error(msg);
    error.name = names.PostIsRequired;
    return error;
}

export function canntGetQueryStringFromRequest(itemName): Error {
    let msg = `Can not get query string '${itemName}' from the request url.`;
    let error = new Error(msg);
    error.name = names.CanntGetHeaderFromRequest;
    return error;
}

export function canntGetHeader(headerName): Error {
    let msg = `Cannt get header '${headerName}' from headers.`;
    let error = new Error(msg);
    error.name = 'CanntGetHeader';
    return error;
}

export function controllerNotExist(path): Error {
    let msg = `Controller is not exists in path '${path}'.`;
    let error = new Error(msg);
    error.name = names.ControllerNotExist;
    return error;
}

export function actionNotExists(action: string, controller: string): Error {
    let msg = `Action '${action}' is not exists in controller '${controller}'`;
    let error = new Error(msg);
    error.name = names.ActionNotExists;
    return error;
}

export function objectNotExistWithId(objectId: string, objectName: string): Error {
    let msg = `${objectName} not exists with id '${objectId}'`;
    let error = new Error(msg);
    error.name = names.ObjectNotExistWithId;
    return error;
}

export function applicationIdRequired(): Error {
    let msg = `Application id is required.`;
    let err = new Error(msg);
    err.name = names.ApplicationIdRequired;

    return err;
}

export function applicationTokenRequired(): Error {
    let msg = `Application token is required.`;
    let err = new Error(msg);
    err.name = names.ApplicationTokenRequired;

    return err;
}

export function verifyCodeIncorrect(verifyCode: string): Error {
    let msg = `Verify code incorrect.`
    let err = new Error(msg) as MyError;
    err.name = names.VerifyCodeIncorrect;
    err.arguments = { verifyCode };
    return err;
}

export function mobileIsBind(mobile: string): Error {
    let msg = `手机号码'${mobile}'已被绑定。`;
    let err = new Error(msg) as MyError;
    err.name = names.MobileIsBind;
    return err;
}

export function postDataNotJSON(data: string): Error {
    let msg = `提交的数据不是 JSON 格式。提交数据为：${data}`;
    let err = new Error(msg) as MyError;
    err.name = 'postDataNotJSON';
    return err;
}

export function invalidObjectId(objectId:string){
    let msg = `非法的 ObjectId:'${objectId}'`;
    let err = new Error(msg) as MyError;
    err.name = 'invalidObjectId';
    return err;
}