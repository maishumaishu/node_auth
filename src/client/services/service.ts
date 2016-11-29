
/// <reference path="../js/typings/fetch.d.ts"/>
import * as  chitu from 'chitu';

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

export let error = chitu.Callbacks();
export let ajaxTimeout = 5000;

let HTTP = 'http://';
let host = 'http://localhost:2014/';
const HTTP_LENGTH = 7;

function ajax<T>(url: string, type: 'post' | 'get', obj?: any): Promise<T> {
    obj = obj || {};

    if (url.length < HTTP_LENGTH || url.substr(0, HTTP_LENGTH).toLowerCase() != HTTP) {
        url = host + url;
    }

    let urlParams = `appId=583c4ee47863ef0548977558&appToken=583c4ee47863ef0548977558`;

    let data;
    let keys = Object.keys(obj);
    if (type == 'post') {
        data = {};
        for (let key of keys)
            data[key] = obj[key];

        data = JSON.stringify(data);
    }
    else {
        for (let key of keys)
            urlParams = urlParams + `&${key}=${obj[key]}`;
    }

    url = url + '?' + urlParams;

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
                    //error.fire(data);
                    error.fire(this, data);
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



