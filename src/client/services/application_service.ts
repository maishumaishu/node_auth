import * as service from './service';
import * as ko from 'knockout';
import * as mapping from 'knockout.mapping';

export class Application {
    static keys = ['id', 'name', 'targetUrl', 'port', 'allowRegister'];
    id = ko.observable<number>();
    name = ko.observable<string>();
    targetUrl = ko.observable<string>();
    port = ko.observable<number>();
    allowRegister = ko.observable<boolean>();
}

export function save(app: Application) {
    let obj = mapping.toJS(app, Application.keys);
    return service.post('application/save', obj);
}
export function list(): JQueryPromise<Array<Application>> {
    return service.post<Array<any>>('application/list').then(function (items) {
        let result: Array<Application> = items.map(o => mapping.fromJS(o, {}, new Application()));
        return result;
    });
}