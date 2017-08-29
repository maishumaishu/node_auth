
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
        },
        ui: {
            exports: 'ui'
        }
    },
    paths: {
        ace: 'js/ace',
        bootbox: 'js/bootbox',
        bootstrap: 'js/bootstrap',
        css: 'js/css',
        chitu: 'js/chitu',
        formValidator: 'js/formValidator',
        knockout: 'js/knockout-3.2.0.debug',
        'knockout.mapping': 'js/knockout.mapping',
        react: 'js/react',
        'react-dom': 'js/react-dom',
        jquery: 'js/jquery-2.1.0',
        text: 'js/text',
        ui: 'js/ui',
        validate: 'js/validate',
        vue: 'js/vue',
        wuzhui: 'js/wuzhui',
    }
});


requirejs(['react', 'react-dom', 'application'], (React, ReactDOM, { app }) => {
    window['React'] = React;
    window['ReactDOM'] = ReactDOM;

    app.run();
    if (!location.hash) {
        location.hash = '#home/applications';
    }
});