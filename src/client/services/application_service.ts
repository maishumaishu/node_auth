import * as service from './service';

export interface Application {
    id: number,
    name: string,
    targetUrl: string
}

export function save(app: Application) {
    return service.ajax('application/save', app);
}
export function list(): JQueryPromise<Array<Application>> {
    return service.ajax<Array<Application>>('application/list');
}