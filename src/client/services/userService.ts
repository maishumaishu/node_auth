import * as service from './service';

interface User {

}
export function login(username: string, password: string): JQueryPromise<any> {
    return $.Deferred().resolve();
}

export function list(args) {
    return service.get<Array<User>>('adminUser/list', args);
}


    //}
//}


//export = UserService;