import chitu = require('chitu');

import ko = require('knockout');

class Application extends chitu.Application {

    constructor() {
        super();
    }

    protected createPageElement(routeData: chitu.RouteData) {
        let element = super.createPageElement(routeData);
        if (routeData.pageName == 'home.applications') {
            document.getElementById('applications-container').appendChild(element);
        }
        else {
            document.getElementById('mainContent').appendChild(element);
        }
        return element;
    }

    protected parseRouteString(routeString: string) {
        let routeData = super.parseRouteString(routeString);
        // routeData.resource = [
        //     `text!${routeData.actionPath}.html`,
        //     `c!css/${routeData.actionPath}.css`
        // ];
        routeData.resources.push({ name: 'html', path: `text!${routeData.actionPath}.html` });
        routeData.resources.push({ name: 'css', path: `c!css/${routeData.actionPath}.css` });
        return routeData;
    }

    protected createPage(routeData) {
        let page = super.createPage(routeData);
        page.load.add((sender: chitu.Page, { html, css }) => {
            sender.element.innerHTML = html;
        });
        page.shown.add((sender: chitu.Page) => {
            $(sender.element).parents('.main-container').first().show();
        });
        page.hidden.add((sender: chitu.Page) => {
            $(sender.element).parents('.main-container').first().hide();
        });
        return page;
    }
}

let app: Application = window['app'] = window['app'] || new Application();
app.pageCreated.add((s, p) => {
    p.element.className = p.name.replace(/\./g, '_');
})
app.run();

export = app;