interface FetchOptions {
    method?: string,
    headers?: any,
    body?: any,
}

interface Response {
    json(): any;
    text(): string | Promise<string>
}

declare interface URLSearchParams {
    new (paramsString?: string);
    append(name: string, value);
}

declare function fetch(url: string, options: FetchOptions): Promise<Response>


declare module "fetch" {
    export = fetch;
}