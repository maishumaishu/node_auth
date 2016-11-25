import * as service from './service';
import * as ko from 'knockout';
import * as mapping from 'knockout.mapping';

export class Application {
    _id: string;
    name: string;
    targetUrl: string;
    port: number;
    allowRegister: boolean;
}

export function save(app: Application) {
    return service.post<Application>('application/save', app);
}
export function list() {
    return service.post<Array<Application>>('application/list');
}