import * as app_service from 'services/application_service';
import { Application } from 'services/application_service';
import Vue = require('vue');



export default function action(page: chitu.Page) {

    let loadPromise = new Promise((reslove, reject) => {
        page.load.add(() => reslove());
    });

    let self = this;
    Promise.all([app_service.list(), loadPromise]).then((results) => {
        let items = results[0];

        //let currentItem: Application;
        let data = { items, app: new Application() };
        let vm = new Vue({
            el: page.element,
            data,
            methods: {
                editApp: function (item: Application) {

                    //currentItem = item;
                    Object.assign(data.app, item);

                    let element = this.$el as HTMLElement;
                    validator.clearErrors();
                    (<any>$(dialogElement)).modal();
                },
                saveApp: function () {
                    if (!validator.validateForm()) {
                        return;
                    }

                    app_service.save(data.app).then((result) => {
                        if (data.app._id == null) {
                            data.items.push();
                        }
                        else {
                            let editItem = data.items.filter(o => o._id == data.app._id)[0];
                            Object.assign(editItem, data.app);
                        }
                    });
                },
                newApp: function () {
                    Object.assign(data.app, new Application());
                    validator.clearErrors();
                    (<any>$(dialogElement)).modal();
                }
            }
        });

        let dialogElement = vm.$el.querySelector('[name="dlg_application"]') as HTMLElement;
        console.assert(dialogElement != null);
        let validator = new FormValidator(dialogElement, [
            { name: '编号', rules: 'required' },
            { name: '名称', rules: 'required' },
            { name: '端口', rules: 'required' },
            { name: '目标URL', rules: 'required' }
        ]);
    });
}



