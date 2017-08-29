
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
export let host = 'http://localhost:2800/';
export let appkey = '58424781034ff82470d06d3e';
const HTTP_LENGTH = 7;

type AjaxType = 'post' | 'get' | 'put';
async function ajax<T>(url: string, type: AjaxType, obj?: any): Promise<T> {
    obj = obj || {};

    if (url.length < HTTP_LENGTH || url.substr(0, HTTP_LENGTH).toLowerCase() != HTTP) {
        url = host + url;
    }

    let headers = {
        ['application-key']: appkey
    }

    let body: string;
    let keys = Object.keys(obj);
    if (type != 'get') {
        headers['content-type'] = 'application/json';
        body = JSON.stringify(obj);
    }
    else {
        let urlParams = '';
        for (let key of keys) {
            if (urlParams != '')
                urlParams = urlParams + '&';

            urlParams = urlParams + `${key}=${obj[key]}`;
        }
        if (urlParams != '')
            url = url + '?' + urlParams;
    }

// fetch()

    let options = {
        headers,
        body,
        method: type,
    };

    let response: Response;
    try {
        response = await fetch(url, options);
    }
    catch (exc) {
        error.fire(this, exc);
        throw exc;
    }
    let responseText = response.text();
    let p: Promise<string>;
    if (typeof responseText == 'string') {
        p = new Promise<string>((reslove, reject) => {
            reslove(responseText);
        })
    }
    else {
        p = responseText as Promise<string>;
    }

    let text = await responseText;
    let textObject = JSON.parse(text);

    if (isError(textObject)) {
        error.fire(this, textObject);
        throw textObject
    }

    return textObject;
}

export function get<T>(url: string, data?: any): Promise<T> {
    return ajax(url, 'get', data);
}

export function post<T>(url: string, data?: any): Promise<T> {
    return ajax(url, 'post', data);
}

// export function put<T>(url: string, data?: any): Promise<T> {
//     return ajax(url, 'put', data);
// }



