(function(factory) { 
                if (typeof define === 'function' && define['amd']) { 
                    define(['jquery'], factory);  
                } else { 
                    factory($); 
                } 
            })(function($) {var chitu;
(function (chitu) {
    const DEFAULT_FILE_BASE_PATH = 'modules';
    class RouteParser {
        constructor(basePath) {
            this.path_string = '';
            this.path_spliter_char = '/';
            this.param_spliter = '?';
            this.name_spliter_char = '.';
            this._actionPath = '';
            this._cssPath = '';
            this._parameters = {};
            this._pageName = '';
            this._pathBase = '';
            this.HASH_MINI_LENGTH = 2;
            this._pathBase = basePath || '';
        }
        parseRouteString(routeString) {
            let routePath;
            let search;
            let param_spliter_index = routeString.indexOf(this.param_spliter);
            if (param_spliter_index > 0) {
                search = routeString.substr(param_spliter_index + 1);
                routePath = routeString.substring(0, param_spliter_index);
            }
            else {
                routePath = routeString;
            }
            if (!routePath)
                throw chitu.Errors.canntParseRouteString(routeString);
            if (search) {
                this._parameters = this.pareeUrlQuery(search);
            }
            let route_parts = routePath.split(this.path_spliter_char).map(o => o.trim());
            if (route_parts.length < 2) {
                throw chitu.Errors.canntParseRouteString(routeString);
            }
            let actionName = route_parts[route_parts.length - 1];
            let path_parts = route_parts.slice(0, route_parts.length - 1);
            let file_path = path_parts.join(this.path_spliter_char);
            let page_name = file_path.split(this.path_spliter_char).join(this.name_spliter_char);
            if (actionName)
                page_name = page_name + this.name_spliter_char + actionName;
            var result = {
                actionPath: (this.basePath ? chitu.combinePath(this.basePath, file_path) : file_path),
                actionName,
                values: this._parameters,
                pageName: page_name,
            };
            return result;
        }
        get basePath() {
            return this._pathBase;
        }
        pareeUrlQuery(query) {
            let match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
            let urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);
            return urlParams;
        }
    }
    chitu.RouteParser = RouteParser;
    var PAGE_STACK_MAX_SIZE = 16;
    var ACTION_LOCATION_FORMATER = '{controller}/{action}';
    var VIEW_LOCATION_FORMATER = '{controller}/{action}';
    class Application {
        constructor() {
            this.pageCreated = chitu.Callbacks();
            this._runned = false;
            this.page_stack = new Array();
            this.fileBasePath = DEFAULT_FILE_BASE_PATH;
            this.backFail = chitu.Callbacks();
        }
        parseRouteString(routeString) {
            let urlParser = new RouteParser(this.fileBasePath);
            return urlParser.parseRouteString(routeString);
        }
        on_pageCreated(page) {
            return chitu.fireCallback(this.pageCreated, this, page);
        }
        get currentPage() {
            if (this.page_stack.length > 0)
                return this.page_stack[this.page_stack.length - 1];
            return null;
        }
        get pages() {
            return this.page_stack;
        }
        createPage(routeData) {
            let previous_page = this.pages[this.pages.length - 1];
            let element = this.createPageElement(routeData);
            let displayer = new chitu.PageDisplayerImplement();
            element.setAttribute('name', routeData.pageName);
            let page = new chitu.Page({
                app: this,
                previous: previous_page,
                routeData: routeData,
                displayer,
                element
            });
            this.page_stack.push(page);
            if (this.page_stack.length > PAGE_STACK_MAX_SIZE) {
                let c = this.page_stack.shift();
                c.close();
            }
            return page;
        }
        createPageElement(routeData) {
            let element = document.createElement('page');
            document.body.appendChild(element);
            return element;
        }
        hashchange() {
            let location = window.location;
            if (location.skipHashChanged == true) {
                location.skipHashChanged = false;
                return;
            }
            var hash = window.location.hash;
            if (!hash) {
                console.log('The url is not contains hash.url is ' + window.location.href);
                return;
            }
            var routeString;
            if (location.hash.length > 1)
                routeString = location.hash.substr(1);
            var pageInfo = this.parseRouteString(routeString);
            var page = this.getPage(pageInfo.pageName);
            this.showPage(routeString);
        }
        run() {
            if (this._runned)
                return;
            var app = this;
            this.hashchange();
            window.addEventListener('hashchange', () => {
                this.hashchange();
            });
            this._runned = true;
        }
        getPage(name) {
            for (var i = this.page_stack.length - 1; i >= 0; i--) {
                var page = this.page_stack[i];
                if (page != null && page.name == name)
                    return page;
            }
            return null;
        }
        showPage(routeString, args) {
            if (!routeString)
                throw chitu.Errors.argumentNull('routeString');
            var routeData = this.parseRouteString(routeString);
            if (routeData == null) {
                throw chitu.Errors.noneRouteMatched(routeString);
            }
            routeData.values = chitu.extend(routeData.values, args || {});
            let previous = this.currentPage;
            let result = new Promise((resolve, reject) => {
                let page = this.createPage(routeData);
                this.on_pageCreated(page);
                page.show();
                resolve(page);
                if (window.location.hash != '#' + routeString) {
                    this.changeLocationHash(routeString);
                }
            });
            return result;
        }
        changeLocationHash(hash) {
            let location = window.location;
            location.skipHashChanged = true;
            location.hash = '#' + hash;
        }
        redirect(routeString, args) {
            let location = window.location;
            location.skipHashChanged = true;
            window.location.hash = routeString;
            return this.showPage(routeString, args);
        }
        back(args = undefined) {
            return new Promise((reslove, reject) => {
                if (this.page_stack.length == 0) {
                    reject();
                    chitu.fireCallback(this.backFail, this, {});
                    return;
                }
                this.currentPage.close();
                this.page_stack.pop();
                reslove();
            });
        }
    }
    chitu.Application = Application;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    class Errors {
        static argumentNull(paramName) {
            var msg = chitu.Utility.format('The argument "{0}" cannt be null.', paramName);
            return new Error(msg);
        }
        static modelFileExpecteFunction(script) {
            var msg = chitu.Utility.format('The eval result of script file "{0}" is expected a function.', script);
            return new Error(msg);
        }
        static paramTypeError(paramName, expectedType) {
            var msg = chitu.Utility.format('The param "{0}" is expected "{1}" type.', paramName, expectedType);
            return new Error(msg);
        }
        static paramError(msg) {
            return new Error(msg);
        }
        static viewNodeNotExists(name) {
            var msg = chitu.Utility.format('The view node "{0}" is not exists.', name);
            return new Error(msg);
        }
        static pathPairRequireView(index) {
            var msg = chitu.Utility.format('The view value is required for path pair, but the item with index "{0}" is miss it.', index);
            return new Error(msg);
        }
        static notImplemented(name) {
            var msg = chitu.Utility.format('The method "{0}" is not implemented.', name);
            return new Error(msg);
        }
        static routeExists(name) {
            var msg = chitu.Utility.format('Route named "{0}" is exists.', name);
            return new Error(msg);
        }
        static ambiguityRouteMatched(url, routeName1, routeName2) {
            var msg = chitu.Utility.format('Ambiguity route matched, {0} is match in {1} and {2}.', url, routeName1, routeName2);
            return new Error(msg);
        }
        static noneRouteMatched(url) {
            var msg = chitu.Utility.format('None route matched with url "{0}".', url);
            var error = new Error(msg);
            return error;
        }
        static emptyStack() {
            return new Error('The stack is empty.');
        }
        static canntParseUrl(url) {
            var msg = chitu.Utility.format('Can not parse the url "{0}" to route data.', url);
            return new Error(msg);
        }
        static canntParseRouteString(routeString) {
            var msg = chitu.Utility.format('Can not parse the route string "{0}" to route data.', routeString);
            return new Error(msg);
        }
        static routeDataRequireController() {
            var msg = 'The route data does not contains a "controller" file.';
            return new Error(msg);
        }
        static routeDataRequireAction() {
            var msg = 'The route data does not contains a "action" file.';
            return new Error(msg);
        }
        static parameterRequireField(fileName, parameterName) {
            var msg = chitu.Utility.format('Parameter {1} does not contains field {0}.', fileName, parameterName);
            return new Error(msg);
        }
        static viewCanntNull() {
            var msg = 'The view or viewDeferred of the page cannt null.';
            return new Error(msg);
        }
        static createPageFail(pageName) {
            var msg = chitu.Utility.format('Create page "{0}" fail.', pageName);
            return new Error(msg);
        }
        static actionTypeError(actionName, pageName) {
            let msg = `The '${actionName}' in page '${pageName}' is expect as function or Class.`;
            return new Error(msg);
        }
        static canntFindAction(actionName, pageName) {
            let msg = `Cannt find action '${actionName}' in page '${pageName}'.`;
            return new Error(msg);
        }
        static scrollerElementNotExists() {
            let msg = "Scroller element is not exists.";
            return new Error(msg);
        }
    }
    chitu.Errors = Errors;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var rnotwhite = (/\S+/g);
    var optionsCache = {};
    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
            object[flag] = true;
        });
        return object;
    }
    class Callback {
        constructor(source) {
            this.source = source;
        }
        add(func) {
            this.source.add(func);
        }
        remove(func) {
            this.source.remove(func);
        }
        has(func) {
            return this.source.has(func);
        }
        fireWith(context, args) {
            return this.source.fireWith(context, args);
        }
        fire(arg1, arg2, arg3, arg4) {
            return this.source.fire(arg1, arg2, arg3);
        }
    }
    chitu.Callback = Callback;
    class Callback2 extends Callback {
        constructor(source) {
            super(source);
        }
        add(func) {
            super.add(func);
        }
    }
    chitu.Callback2 = Callback2;
    function Callbacks() {
        let options = null;
        options = typeof options === "string" ?
            (optionsCache[options] || createOptions(options)) :
            jQuery.extend({}, options);
        var memory, fired, firing, firingStart, firingLength, firingIndex, list = [], stack = !options.once && [], fire = function (data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
                var result = list[firingIndex].apply(data[0], data[1]);
                if (result != null) {
                    data[0].results.push(result);
                }
                if (result === false && options.stopOnFalse) {
                    memory = false;
                    break;
                }
            }
            firing = false;
            if (list) {
                if (stack) {
                    if (stack.length) {
                        fire(stack.shift());
                    }
                }
                else if (memory) {
                    list = [];
                }
                else {
                    self.disable();
                }
            }
        }, self = {
            results: [],
            add: function () {
                if (list) {
                    var start = list.length;
                    (function add(args) {
                        jQuery.each(args, function (_, arg) {
                            var type = jQuery.type(arg);
                            if (type === "function") {
                                if (!options.unique || !self.has(arg)) {
                                    list.push(arg);
                                }
                            }
                            else if (arg && arg.length && type !== "string") {
                                add(arg);
                            }
                        });
                    })(arguments);
                    if (firing) {
                        firingLength = list.length;
                    }
                    else if (memory) {
                        firingStart = start;
                        fire(memory);
                    }
                }
                return this;
            },
            remove: function () {
                if (list) {
                    jQuery.each(arguments, function (_, arg) {
                        var index;
                        while ((index = jQuery.inArray(arg, list, index)) > -1) {
                            list.splice(index, 1);
                            if (firing) {
                                if (index <= firingLength) {
                                    firingLength--;
                                }
                                if (index <= firingIndex) {
                                    firingIndex--;
                                }
                            }
                        }
                    });
                }
                return this;
            },
            has: function (fn) {
                return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
            },
            empty: function () {
                list = [];
                firingLength = 0;
                return this;
            },
            disable: function () {
                list = stack = memory = undefined;
                return this;
            },
            disabled: function () {
                return !list;
            },
            lock: function () {
                stack = undefined;
                if (!memory) {
                    self.disable();
                }
                return this;
            },
            locked: function () {
                return !stack;
            },
            fireWith: function (context, args) {
                context.results = [];
                if (list && (!fired || stack)) {
                    args = args || [];
                    args = [context, args.slice ? args.slice() : args];
                    if (firing) {
                        stack.push(args);
                    }
                    else {
                        fire(args);
                    }
                }
                return context.results;
            },
            fire: function () {
                return self.fireWith(this, arguments);
            },
            fired: function () {
                return !!fired;
            },
            count: function () {
                return list.length;
            }
        };
        return new Callback(self);
    }
    chitu.Callbacks = Callbacks;
    function fireCallback(callback, sender, ...args) {
        let context = sender;
        args.unshift(sender);
        var results = callback.fireWith(context, args);
        var deferreds = new Array();
        for (var i = 0; i < results.length; i++) {
            if (results[i] instanceof Promise)
                deferreds.push(results[i]);
        }
        if (deferreds.length == 0) {
            return new Promise((reslove) => {
                reslove();
            });
        }
        return Promise.all(deferreds);
    }
    chitu.fireCallback = fireCallback;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    class Page {
        constructor(params) {
            this.animationTime = 300;
            this.load = chitu.Callbacks();
            this.showing = chitu.Callbacks();
            this.shown = chitu.Callbacks();
            this.hiding = chitu.Callbacks();
            this.hidden = chitu.Callbacks();
            this.closing = chitu.Callbacks();
            this.closed = chitu.Callbacks();
            this._element = params.element;
            this._previous = params.previous;
            this._app = params.app;
            this._routeData = params.routeData;
            this._displayer = params.displayer;
            this.loadPageAction(params.routeData);
        }
        on_load(...resources) {
            return chitu.fireCallback(this.load, this, resources);
        }
        on_showing() {
            return chitu.fireCallback(this.showing, this);
        }
        on_shown() {
            return chitu.fireCallback(this.shown, this);
        }
        on_hiding() {
            return chitu.fireCallback(this.hiding, this);
        }
        on_hidden() {
            return chitu.fireCallback(this.hidden, this);
        }
        on_closing() {
            return chitu.fireCallback(this.closing, this);
        }
        on_closed() {
            return chitu.fireCallback(this.closed, this);
        }
        show() {
            this.on_showing();
            this._displayer.show(this);
            this.on_shown();
        }
        hide() {
            this.on_hiding();
            this._displayer.hide(this);
            this.on_hidden();
        }
        close() {
            this.hide();
            this.on_closing();
            this._element.remove();
            this.on_closed();
        }
        get element() {
            return this._element;
        }
        get previous() {
            return this._previous;
        }
        get routeData() {
            return this._routeData;
        }
        get name() {
            return this.routeData.pageName;
        }
        createActionDeferred(routeData) {
            return new Promise((resolve, reject) => {
                var url = routeData.actionPath;
                requirejs([url], (obj) => {
                    if (!obj) {
                        console.warn(chitu.Utility.format('加载活动“{0}”失败。', routeData.pageName));
                        reject();
                        return;
                    }
                    resolve(obj);
                }, (err) => reject(err));
            });
        }
        loadPageAction(routeData) {
            var action_deferred = new Promise((reslove, reject) => {
                this.createActionDeferred(routeData).then((actionResult) => {
                    let actionName = routeData.actionName || 'default';
                    let action = actionResult[actionName];
                    if (action == null) {
                        throw chitu.Errors.canntFindAction(routeData.actionName, routeData.pageName);
                    }
                    if (typeof action == 'function') {
                        if (action['prototype'] != null)
                            new action(this);
                        else
                            action(this);
                        reslove();
                    }
                    else {
                        reject();
                        throw chitu.Errors.actionTypeError(routeData.actionName, routeData.pageName);
                    }
                });
            });
            let result = Promise.all([action_deferred, chitu.loadjs(...routeData.resource || [])]).then((results) => {
                let resourceResults = results[1];
                this.on_load(...resourceResults);
            });
            return result;
        }
    }
    chitu.Page = Page;
    class PageDisplayerImplement {
        show(page) {
            page.element.style.display = 'block';
            if (page.previous != null) {
                page.previous.element.style.display = 'none';
            }
        }
        hide(page) {
            page.element.style.display = 'none';
            if (page.previous != null) {
                page.previous.element.style.display = 'block';
            }
        }
    }
    chitu.PageDisplayerImplement = PageDisplayerImplement;
})(chitu || (chitu = {}));


var chitu;
(function (chitu) {
    var e = chitu.Errors;
    class Utility {
        static isType(targetType, obj) {
            for (var key in targetType.prototype) {
                if (obj[key] === undefined)
                    return false;
            }
            return true;
        }
        static isDeferred(obj) {
            if (obj == null)
                return false;
            if (obj.pipe != null && obj.always != null && obj.done != null)
                return true;
            return false;
        }
        static format(source, ...params) {
            for (var i = 0; i < params.length; i++) {
                source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                    return params[i];
                });
            }
            return source;
        }
        static fileName(url, withExt) {
            if (!url)
                throw e.argumentNull('url');
            withExt = withExt || true;
            url = url.replace('http://', '/');
            var filename = url.replace(/^.*[\\\/]/, '');
            if (withExt === true) {
                var arr = filename.split('.');
                filename = arr[0];
            }
            return filename;
        }
        static log(msg, args = []) {
            if (!window.console)
                return;
            if (args == null) {
                console.log(msg);
                return;
            }
            var txt = this.format.apply(this, arguments);
            console.log(txt);
        }
    }
    Utility.loadjs = loadjs;
    chitu.Utility = Utility;
    function extend(obj1, obj2) {
        if (obj1 == null)
            throw chitu.Errors.argumentNull('obj1');
        if (obj2 == null)
            throw chitu.Errors.argumentNull('obj2');
        for (let key in obj2) {
            obj1[key] = obj2[key];
        }
        return obj1;
    }
    chitu.extend = extend;
    function combinePath(path1, path2) {
        if (!path1)
            throw chitu.Errors.argumentNull('path1');
        if (!path2)
            throw chitu.Errors.argumentNull('path2');
        path1 = path1.trim();
        if (!path1.endsWith('/'))
            path1 = path1 + '/';
        return path1 + path2;
    }
    chitu.combinePath = combinePath;
    function loadjs(...modules) {
        if (modules.length == 0)
            return Promise.resolve([]);
        return new Promise((reslove, reject) => {
            requirejs(modules, function () {
                var args = [];
                for (var i = 0; i < arguments.length; i++)
                    args[i] = arguments[i];
                reslove(args);
            }, function () {
                reject();
            });
        });
    }
    chitu.loadjs = loadjs;
})(chitu || (chitu = {}));

window['chitu'] = window['chitu'] || chitu 
                            
 return chitu;
            });