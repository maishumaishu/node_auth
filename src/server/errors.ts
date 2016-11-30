

interface MyError extends Error {
    arguments: any
}

//export class Errors {
export let names = {
    ApplicationExists: 'ApplicationExists',
    ApplicationIdRequired: 'ApplicationIdRequired',
    ApplicationTokenRequired: 'ApplicationTokenRequired',
    ArgumentNull: 'ArgumentNull',
    FieldNull: 'FieldNull',
    NotAllowRegister: 'NotAllowRegister',
    NotImplement: 'NotImplement',
    PasswordIncorect: 'PasswordIncorect',
    Success: 'Success',
    UserExists: 'UserExists',
    UserNotExists: 'UserNotExists',
    InvalidToken: 'InvalidToken',
    DeleteResultZero: 'DeleteResultZero',
    UpdateResultZero: 'UpdateResultZero',
    PostIsRequired: 'PostIsRequired',
    CanntGetHeaderFromRequest: 'CanntGetHeaderFromRequest',
    ControllerNotExist: 'ControllerNotExist',
    ActionNotExists: 'ActionNotExists',
    ObjectNotExistWithId: 'ObjectNotExistWithId'
}

export function fieldNull(fieldName: string, objectName: string): Error {
    let msg = `The '${fieldName}' field of '${objectName}' object cannt be null.`;
    let error = new Error(msg);
    error.name = names.FieldNull;
    return error;
}

export function argumentNull(argumentName: string) {
    let msg = `Argument '${argumentName}' cannt be null`;
    let error = new Error(msg);
    error.name = names.ArgumentNull;
    return error;
}

export function passwordIncorect(username: string) {
    let msg = `Password incorect.`;
    let error = new Error(msg);
    error.name = names.PasswordIncorect;
    return error;
}

export function userExists(username: string): Error {
    let msg = `User '${username}' is exists.`;
    let error = new Error(msg);
    error.name = names.UserExists;
    (<any>error).arguments = { username };
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

export function userNotExists(username: string) {
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

export function applicationExists(name: string) {
    let msg = `Application with name '${name}' is exists.`;
    let error = new Error(msg) as MyError;
    error.name = names.ApplicationExists;
    error.arguments = { name };
    return error;
}

export function deleteResultZero() {
    let msg = 'Deleted count is zero, maybe the object is not exists.'
    let error = new Error(msg);
    error.name = names.DeleteResultZero;
    return error;
}

export function updateResultZero() {
    let msg = 'Updated count is zero, maybe the object is not exists.'
    let error = new Error(msg);
    error.name = names.UpdateResultZero;
    return error;
}

export function postIsRequired() {
    let msg = 'Post request is required.';
    let error = new Error(msg);
    error.name = names.PostIsRequired;
    return error;
}

export function canntGetHeaderFromRequest(headerName) {
    let msg = `Can not get header '${headerName}' from the request.`;
    let error = new Error(msg);
    error.name = names.CanntGetHeaderFromRequest;
    return error;
}

export function controllerNotExist(path) {
    let msg = `Controller is not exists in path '${path}'.`;
    let error = new Error(msg);
    error.name = names.ControllerNotExist;
    return error;
}

export function actionNotExists(action: string, controller: string) {
    let msg = `Action '${action}' is not exists in controller '${controller}'`;
    let error = new Error(msg);
    error.name = names.ActionNotExists;
    return error;
}

export function objectNotExistWithId(objectId: string, objectName: string) {
    let msg = `${objectName} not exists with id '${objectId}'`;
    let error = new Error(msg);
    error.name = names.ObjectNotExistWithId;
    return error;
}

export function applicationIdRequired() {
    let msg = `Application id is required.`;
    let err = new Error(msg);
    err.name = names.ApplicationIdRequired;

    return err;
}

export function applicationTokenRequired() {
    let msg = `Application token is required.`;
    let err = new Error(msg);
    err.name = names.ApplicationTokenRequired;

    return err;
}

export function verifyCodeIncorrect(verifyCode: string) {
    let msg = `Verify code incorrect.`
    let err = new Error(msg) as MyError;
    err.name = 'verifyCodeIncorrect';
    err.arguments = { verifyCode };
    return err;
}
