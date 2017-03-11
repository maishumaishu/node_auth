import chitu = require('chitu');

import ko = require('knockout');
import mapping = require('knockout.mapping');

class Application extends chitu.Application {

    constructor() {
        super();
        this.pageDisplayType = PageDisplayerImplement;
    }

    // protected createPageElement(routeData: chitu.RouteData) {
    //     let element: HTMLElement = document.createElement('div');
    //     element.className = 'page';
    //     if (routeData.pageName == 'home.applications') {
    //         document.getElementById('applications-container').appendChild(element);
    //     }
    //     else {
    //         document.getElementById('mainContent').appendChild(element);
    //     }
    //     return element;
    // }

    protected parseRouteString(routeString: string) {
        let routeData = super.parseRouteString(routeString);
        return routeData;
    }

    protected createPage(routeData) {
        let page = super.createPage(routeData);
        return page;
    }
}

class PageDisplayerImplement implements chitu.PageDisplayer {
    show(page: chitu.Page) {
        page.element.style.display = 'block';
        let parentContainer = $(page.element).parents('.main-container')[0];
        $(parentContainer).show();

        if (page.previous != null) {
            //$(page.previous.element).parents('.main-container').first().hide();
            let previousContainer = $(page.previous.element).parents('.main-container')[0];
            if (previousContainer != parentContainer) {
                previousContainer.style.display = 'none';
            }
            page.previous.element.style.display = 'none';
        }
        return Promise.resolve();
    }
    hide(page: chitu.Page) {
        $(page.element).parents('.main-container').first().hide();
        page.element.style.display = 'none';
        if (page.previous != null) {
            page.previous.element.style.display = 'block';
            $(page.previous.element).parents('.main-container').first().show();
        }
        return Promise.resolve();
    }
}

let app: Application = window['app'] = window['app'] || new Application();
app.pageCreated.add((s, p) => {
    p.element.className = p.name.replace(/\./g, '_');
})
app.run();

export = app;

//=========================================================================
// 菜单
// import menus = require('menus');

// let data = menus;//JSON.parse(text);
// var stack = [];
// for (var i = 0; i < data.length; i++)
//     stack.push(data[i]);

// while (stack.length > 0) {
//     var item = stack.pop();
//     item.url = item.url || '';
//     item.children = item.children || [];
//     item.icon = item.icon || '';
//     item.visible = (item.visible === undefined) ? true : item.visible;
//     item.visibleChildren = [];

//     for (var i = 0; i < item.children.length; i++) {
//         if (item.children[i].visible === undefined || item.children[i].visible !== false)
//             item.visibleChildren.push(item.children[i]);

//         stack.push(item.children[i]);
//     }
// }
// var model = {
//     menus: data
// };

// ko.applyBindings(model, document.getElementById('sidebar'));
// ko.applyBindings(model, document.getElementById('navbar'))
//=========================================================================