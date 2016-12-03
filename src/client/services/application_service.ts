import * as service from './service';
import * as ko from 'knockout';
import * as mapping from 'knockout.mapping';

export class Application {
    _id: string = null;
    name: string = null;
    targetUrl: string = null;
    allowRegister: boolean = null;
    token: string = '';
}

export function save(app: Application) {
    return service.post<Application>('application/save', { app });
}
export function list() {
    return service.get<Array<Application>>('application/list');
}
export function newToken(app: Application) {
    return service.post<{ token: string }>('application/newToken', { appId: app._id });
}