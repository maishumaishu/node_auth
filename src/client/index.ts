
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
        knockout: 'js/knockout-3.2.0.debug',
        'knockout.mapping': 'js/knockout.mapping',
        react: 'js/react',
        'react-dom': 'js/react-dom',
        jquery: 'js/jquery-2.1.0',
        text: 'js/text',
        validate: 'js/validate',
        vue: 'js/vue',
        wuzhui: 'js/wuzhui',
    }
});


requirejs(['react', 'react-dom', 'application', 'ace', 'wuzhui', 'validate'], (React, ReactDOM) => {
    window['React'] = React;
    window['ReactDOM'] = ReactDOM;

    if (!location.hash) {
        location.hash = '#home/applications';
    }
});