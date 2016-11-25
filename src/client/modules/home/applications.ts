import * as app_service from 'services/application_service';
import { Application } from 'services/application_service';
import Vue = require('vue');



export default function action(page: chitu.Page) {

    let loadPromise = new Promise((reslove, reject) => {
        page.load.add(() => reslove());
    });

    let self = this;
    Promise.all([app_service.list(), loadPromise]).then((results) => {
        debugger;
        let items = results[0];

        let data = { items };
        let vm = new Vue({
            el: page.element,
            data,
            methods: {
                editApp: function (index: number) {
                    let element = this.$el as HTMLElement;
                    let dialogElements = element.querySelectorAll('[name="dlg_application"]');
                    let dialogElement = dialogElements.item(index) as HTMLElement;
                    let validator = getModalValidator(dialogElement);
                    validator.clearErrors();
                    (<any>$(dialogElement)).modal();
                },
                saveApp: function (item: Application, event: MouseEvent) {
                    let self = this as VueInstance;

                    let modal = (<any>event.target).closest('[name="dlg_application"]') as HTMLElement;
                    let validator = getModalValidator(modal);
                    if (!validator.validateForm()) {
                        return;
                    }

                    app_service.save(item).then((result) => {
                        //item._id = result._id;
                        Object.assign(item, result);
                    });
                },
                newApp: function () {
                    if (!data.items[data.items.length - 1]._id) {
                        data.items.pop();
                    }

                    let app = new Application();
                    data.items.push(app);
                    let self = this as VueInstance;
                    (this as VueInstance).$nextTick(() => {
                        let element = this.$el as HTMLElement;
                        let dialogElements = element.querySelectorAll('[name="dlg_application"]');
                        let dialogElement = dialogElements.item(dialogElements.length - 1) as HTMLElement;
                        let validator = getModalValidator(dialogElement);
                        validator.clearErrors();
                        (<any>$(dialogElement)).modal();
                    });
                }
            }
        });
    });

    function getModalValidator(modalElement: HTMLElement): FormValidator {
        let validator = (<any>modalElement).validator;
        if (validator == null) {
            validator = new FormValidator(modalElement, [
                { name: '编号', rules: 'required' },
                { name: '名称', rules: 'required' },
                { name: '端口', rules: 'required' },
                { name: '目标URL', rules: 'required' }
            ]);
            (<any>modalElement).validator = validator;
        }
        return validator;
    }


}



