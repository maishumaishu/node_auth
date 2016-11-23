
import * as $ from 'jquery';

function isError(data) {
    if ((data.name as string || '').toLowerCase() == 'success')
        return false;

    if (data.name != undefined && data.message != undefined && data.stack != undefined)
        return true;

    return false;
}

export let error = $.Callbacks();
export let ajaxTimeout = 5000;

let HTTP = 'http://';
//let host = 'http://localhost:3000/';
let host = 'http://localhost:3010/';
const HTTP_LENGTH = 7;

export function ajax<T>(url: string, data?: any): JQueryPromise<T> {

    if (url.length < HTTP_LENGTH || url.substr(0, HTTP_LENGTH).toLowerCase() != HTTP) {
        url = host + url;
    }

    let result = $.Deferred<T>();
    data = data || {};
    $.ajax(url, {
        data: data
    }).done(function (data) {
        if (isError(data)) {
            error.fire(data);
            result.reject(data);
            return;
        }
        result.resolve(data);

    }).fail(function (jqXHR, textStatus) {
        var err = new Error(jqXHR.statusText);
        err.name = textStatus;
        if (jqXHR.status == 0 && jqXHR.statusText == 'error') {
            err.name = 'ConnectRemoteServerFail';
            err.message = 'Cannt not connect remote server';
        }
        error.fire(err);
        result.reject(err);

    }).always(function () {
        clearTimeout(timeoutid);
    });

    //超时处理
    let timeoutid = setTimeout(() => {
        if (result.state() == 'pending') {
            result.reject({ Code: 'Timeout', Message: 'Ajax call timemout.' });
        }
        clearTimeout(timeoutid);
    }, ajaxTimeout);

    return result;
}

export function post<T>(url: string, data?: any): Promise<T> {
    if (url.length < HTTP_LENGTH || url.substr(0, HTTP_LENGTH).toLowerCase() != HTTP) {
        url = host + url;
    }

    data = data || {};
    let options = {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        method: 'post'
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
                if (data.Type != 'ErrorObject')
                    resolve(data);


                if (data.Code == 'Success') {
                    resolve(data);
                    return;
                }

                let err = new Error(data.Message);
                err.name = data.Code;
                reject(err);
                return;
            });
        })
    });
}

