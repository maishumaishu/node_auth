import * as service from './service';
import * as ko from 'knockout';
import * as mapping from 'knockout.mapping';

export class Application {
    id = ko.observable<number>();
    name = ko.observable<string>();
    targetUrl = ko.observable<string>();
    port = ko.observable<number>();
}

export function save(app: Application) {
    let obj = mapping.toJS(app);
    return service.ajax('application/save', obj);
}
export function list(): JQueryPromise<Array<Application>> {
    return service.ajax<Array<any>>('application/list').then(function (items) {
        let result: Array<Application> = items.map(o => mapping.fromJS(o, {}, new Application()));
        return result;
    });
}