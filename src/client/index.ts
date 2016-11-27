
requirejs.config({
    shim: {
        ace: {
            deps: ['jquery', 'bootstrap']
        },
        bootstrap: {
            deps: ['jquery']
        },
        wuzhui: {
            deps: ['jquery']
        },
        application: {
            deps: ['errorHandle']
        }
    },
    paths: {
        ace: 'js/ace',
        bootbox: 'js/bootbox',
        bootstrap: 'js/bootstrap',
        c: 'js/css',
        chitu: 'js/chitu',
        crossroads: 'js/crossroads',
        hammer: 'js/hammer',
        iscroll: 'js/iscroll-probe',
        jquery: 'js/jquery-2.1.0',
        text: 'js/text',
        validate: 'js/validate',
        vue: 'js/vue',
        wuzhui: 'js/wuzhui',
    }
});


requirejs(['application', 'menus', 'ace', 'wuzhui', 'validate'], (app: chitu.Application, menus) => {
    if (!location.hash) {
        location.hash = '#home/index';
    }
    var model = {
        menus: []
    };
    var stack = [];
    for (var i = 0; i < menus.length; i++)
        stack.push(menus[i]);

    while (stack.length > 0) {
        var item = stack.pop();
        item.url = item.url || '';
        item.children = item.children || [];
        item.icon = item.icon || '';
        item.visible = (item.visible === undefined) ? true : item.visible;
        item.visibleChildren = [];

        for (var i = 0; i < item.children.length; i++) {
            if (item.children[i].visible === undefined || item.children[i].visible !== false)
                item.visibleChildren.push(item.children[i]);

            stack.push(item.children[i]);
        }
    }

    // model.menus(menus);
    // ko.applyBindings(model, document.getElementById('sidebar'));
    // ko.applyBindings(model, document.getElementById('navbar'));
});