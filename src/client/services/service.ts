
/// <reference path="../js/typings/fetch.d.ts"/>

function isError(data: Error) {

    if (data.name == 'Success') {
        return false;
    }

    let keys = Object.keys(data);
    if (keys.indexOf('name') >= 0 && keys.indexOf('message') >= 0) {
        return true;
    }

    return false;
}

export let error = $.Callbacks();
export let ajaxTimeout = 5000;

let HTTP = 'http://';
let host = 'http://localhost:3010/';
const HTTP_LENGTH = 7;

// export function ajax<T>(url: string, data?: any): JQueryPromise<T> {

//     if (url.length < HTTP_LENGTH || url.substr(0, HTTP_LENGTH).toLowerCase() != HTTP) {
//         url = host + url;
//     }

//     let result = $.Deferred<T>();
//     data = data || {};
//     $.ajax(url, {
//         data: data
//     }).done(function (data) {
//         if (isError(data)) {
//             error.fire(data);
//             result.reject(data);
//             return;
//         }
//         result.resolve(data);

//     }).fail(function (jqXHR, textStatus) {
//         var err = new Error(jqXHR.statusText);
//         err.name = textStatus;
//         if (jqXHR.status == 0 && jqXHR.statusText == 'error') {
//             err.name = 'ConnectRemoteServerFail';
//             err.message = 'Cannt not connect remote server';
//         }
//         error.fire(err);
//         result.reject(err);

//     }).always(function () {
//         clearTimeout(timeoutid);
//     });

//     //超时处理
//     let timeoutid = setTimeout(() => {
//         if (result.state() == 'pending') {
//             result.reject({ Code: 'Timeout', Message: 'Ajax call timemout.' });
//         }
//         clearTimeout(timeoutid);
//     }, ajaxTimeout);

//     return result;
// }

function ajax<T>(url: string, type: 'post' | 'get', obj?: any): Promise<T> {
    if (url.length < HTTP_LENGTH || url.substr(0, HTTP_LENGTH).toLowerCase() != HTTP) {
        url = host + url;
    }

    obj = obj || {};
    let data;
    let keys = Object.keys(obj);
    if (type == 'post') {
        data = {};
        for (let key of keys)
            data[key] = obj[key];

        data = JSON.stringify(data);
    }
    else {
        let urlParams = '';
        for (let key of keys)
            urlParams = urlParams + `&${key}=${obj[key]}`;

        if (urlParams.length > 0) {
            url = url + '?' + urlParams.substr(1);
        }
    }

    let options = {
        headers: {
            // 'Content-Type': 'application/json'
        },
        body: data,
        method: type,
    } as FetchOptions;

    return fetch(url, options).then((response) => {
        let text = response.text();
        let p: Promise<string>;
        if (typeof text == 'string') {
            p = new Promise<string>((reslove, reject) => {
                reslove(text);
            })
        }
        else {
            p = text as Promise<string>;
        }

        return p.then((text) => {
            return new Promise((resolve, reject) => {
                let data = JSON.parse(text);

                if (isError(data)) {
                    error.fire(data);
                    reject(data);
                    return;
                }

                resolve(data);
                return;
            });
        })
    });
}

export function get<T>(url: string, data?: any): Promise<T> {
    return ajax(url, 'get', data);
}

export function post<T>(url: string, data?: any): Promise<T> {
    return ajax(url, 'post', data);
}



