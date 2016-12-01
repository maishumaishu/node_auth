import * as service from './service';
import * as ko from 'knockout';
import * as mapping from 'knockout.mapping';

export class Application {
    _id: string = null;
    name: string = null;
    targetUrl: string = null;
    allowRegister: boolean = null;
}

export function save(app: Application) {
    return service.post<Application>('application/save', { app });
}
export function list() {
    return service.get<Array<Application>>('application/list');
}