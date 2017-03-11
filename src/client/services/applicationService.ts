import * as service from './service';

export interface RedirectInfo {
    urlPattern: string,
    target: string,
}
export interface Application {
    _id: string;
    name: string;
    targetUrl: string;
    allowRegister: boolean;
    token: string;
    redirects: RedirectInfo[]
}

export function save(app: Application) {
    return service.post<Application>('application/save', { app });
}
export function list() {
    return service.get<Array<Application>>('application/list');
}
export function newToken(app: Application) {
    return service.post<{ token: string }>('application/newToken');
}
export function get(appId: string) {
    return service.get<Application>('application/get', { appId });
}