import * as service from './service';

interface User {

}
export function login(username: string, password: string): Promise<any> {
    // return Promise.resolve();
    let args = { username, password };
    return service.post<string>('adminUser/login', args);
}

export function list(args) {
    return service.get<Array<User>>('adminUser/list', args);
}


    //}
//}


//export = UserService;