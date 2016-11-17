declare namespace chitu {
    interface RouteData {
        actionPath: string;
        actionName: string;
        values: any;
        pageName: string;
        resource?: string[];
    }
    class RouteParser {
        private path_string;
        private path_spliter_char;
        private param_spliter;
        private name_spliter_char;
        private _actionPath;
        private _cssPath;
        private _parameters;
        private _pageName;
        private pathBase;
        private HASH_MINI_LENGTH;
        constructor(pathBase?: string);
        parseRouteString(routeString: string): RouteData;
        private pareeUrlQuery(query);
    }
    interface ApplicationConfig {
        pathBase?: string;
    }
    class Application {
        pageCreated: Callback<Application, Page>;
        private _config;
        private _runned;
        private zindex;
        private page_stack;
        parseRouteString: (routeString: string) => RouteData;
        backFail: Callback<Application, {}>;
        constructor(config?: ApplicationConfig);
        private on_pageCreated(page);
        config: ApplicationConfig;
        currentPage: Page;
        pages: Array<Page>;
        private createPage(routeData);
        protected hashchange(): void;
        run(): void;
        getPage(name: string): Page;
        showPage<T extends Page>(routeString: string, args?: any): Promise<T>;
        private changeLocationHash(hash);
        protected createPageNode(): HTMLElement;
        redirect<T extends Page>(routeString: string, args?: any): Promise<T>;
        back(args?: any): Promise<void>;
    }
}

declare namespace chitu {
    class Errors {
        static argumentNull(paramName: string): Error;
        static modelFileExpecteFunction(script: any): Error;
        static paramTypeError(paramName: string, expectedType: string): Error;
        static paramError(msg: string): Error;
        static viewNodeNotExists(name: any): Error;
        static pathPairRequireView(index: any): Error;
        static notImplemented(name: any): Error;
        static routeExists(name: any): Error;
        static ambiguityRouteMatched(url: any, routeName1: any, routeName2: any): Error;
        static noneRouteMatched(url: any): Error;
        static emptyStack(): Error;
        static canntParseUrl(url: string): Error;
        static canntParseRouteString(routeString: string): Error;
        static routeDataRequireController(): Error;
        static routeDataRequireAction(): Error;
        static parameterRequireField(fileName: any, parameterName: any): Error;
        static viewCanntNull(): Error;
        static createPageFail(pageName: string): Error;
        static actionTypeError(actionName: string, pageName: string): Error;
        static canntFindAction(actionName: string, pageName: any): Error;
        static scrollerElementNotExists(): Error;
    }
}

declare namespace chitu {
    interface EventCallback<S, A> {
        (sender: S, args: A): Promise<any> | void;
    }
    class Callback<S, A> {
        source: any;
        constructor(source: any);
        add(func: Function): void;
        remove(func: Function): void;
        has(func: Function): boolean;
        fireWith(context: any, args: any): any;
        fire(arg1?: any, arg2?: any, arg3?: any, arg4?: any): any;
    }
    function Callbacks<S, A>(options?: any): Callback<S, A>;
    function fireCallback<S, A>(callback: Callback<S, A>, sender: S, args: A): Promise<any>;
}

declare namespace chitu {
    interface PageActionConstructor {
        new (args: Page): any;
    }
    interface PageDisplayer {
        show(page: Page): any;
        hide(page: Page): any;
        visible(page: Page): boolean;
    }
    class Page {
        private animationTime;
        private num;
        private _element;
        private _previous;
        private _app;
        private _routeData;
        private _displayer;
        load: Callback<Page, any>;
        showing: Callback<Page, any>;
        shown: Callback<Page, any>;
        hiding: Callback<Page, any>;
        hidden: Callback<Page, any>;
        closing: Callback<Page, any>;
        closed: Callback<Page, any>;
        constructor(params: {
            app: Application;
            routeData: RouteData;
            element: HTMLElement;
            displayer: PageDisplayer;
            previous?: Page;
        });
        on_load(args: any): Promise<any>;
        on_showing(args: any): Promise<any>;
        on_shown(args: any): Promise<any>;
        on_hiding(args: any): Promise<any>;
        on_hidden(args: any): Promise<any>;
        on_closing(args: any): Promise<any>;
        on_closed(args: any): Promise<any>;
        show(): void;
        hide(): void;
        close(): void;
        visible: boolean;
        element: HTMLElement;
        previous: Page;
        routeData: RouteData;
        name: string;
        private createActionDeferred(routeData);
        private loadPageAction(routeData);
    }
    class PageDisplayerImplement implements PageDisplayer {
        show(page: Page): void;
        hide(page: Page): void;
        visible(page: Page): boolean;
    }
    class PageFactory {
        private _app;
        constructor(app: Application);
        static createInstance(params: {
            app: Application;
            routeData: RouteData;
            previous?: Page;
        }): Page;
    }
}


declare namespace chitu {
    class Utility {
        static extend(obj1: any, obj2: any): any;
        static isType(targetType: Function, obj: any): boolean;
        static isDeferred(obj: any): boolean;
        static format(source: string, ...params: string[]): string;
        static fileName(url: any, withExt: any): string;
        static log(msg: any, args?: any[]): void;
        static loadjs(...modules: string[]): Promise<any>;
    }
}
declare module "chitu" { 
            export = chitu; 
        }
