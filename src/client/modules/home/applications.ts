import * as application_service from 'services/application_service';
import * as validation from 'knockout.validation';
import * as mapping from 'knockout.mapping';

let app_fields = ['id', 'name', 'targetUrl'];
export  class ApplicationsPage {

    private app: application_service.Application;

    private val: KnockoutValidationErrors;
    private $dialog: JQuery;

    constructor(page: chitu.Page) {
        debugger;
        requirejs([`c!css/${page.routeData.actionPath}`])
        requirejs([`text!${page.routeData.actionPath}.html`], (html) => {
            page.element.innerHTML = html;

            this.app = new application_service.Application();
            this.app.name.extend({ required: { message: '请输入应用名称' } });
            this.app.targetUrl.extend({ required: { message: '请输入转发的目标URL' } });

            this.items = ko.observableArray<application_service.Application>();
            ko.applyBindings(this, page.element);

            this.val = validation.group(this.app);
            this.$dialog = $(page.element).find('[name="dlg_application"]');
        });

        page.load.add((sender, args) => this.page_load(this, args));
    }

    private page_load(sender: ApplicationsPage, args) {
        return application_service.list().done((data: Array<any>) => {
            this.items(data);
        })
    }

    //==========================================================
    // 绑定
    private items: KnockoutObservableArray<application_service.Application>;



    private newApp = () => {
        mapping.fromJS(mapping.toJS(new application_service.Application()), {}, this.app);
        this.val.showAllMessages(false);
        (<any>this.$dialog).modal();

    }

    private editApp = (item: application_service.Application) => {
        mapping.fromJS(mapping.toJS(item), {}, this.app);
        this.val.showAllMessages(false);
        (<any>this.$dialog).modal();
    }

    private saveApp = () => {
        if (!this.app['isValid']()) {
            this.val.showAllMessages();
            return;
        }

        application_service.save(this.app);
    }
    //==========================================================
}

export default ApplicationsPage;

// export function applications(page: chitu.Page) {

//     let model = {
//         app: new application_service.Application(),
//         items: ko.observableArray<application_service.Application>(),
//         newApp,
// editApp,
// saveApp
//     }


//     model.app.name.extend({ required: { message: '请输入应用名称' } });
//     model.app.targetUrl.extend({ required: { message: '请输入转发的目标URL' } });

//     ko.applyBindings(model, page.element);

//     let val = validation.group(model.app);

//     let $dialog = $(page.element).find('[name="dlg_application"]');
//     function newApp() {
//         mapping.fromJS(mapping.toJS(new application_service.Application()), {}, this.app);
//         val.showAllMessages(false);
//         (<any>$dialog).modal();
//     }

//     function editApp(item: application_service.Application) {
//         mapping.fromJS(mapping.toJS(item), {}, this.app);
//         this.val.showAllMessages(false);
//         (<any>this.$dialog).modal();
//     }

//     function saveApp() {
//         if (!this.app['isValid']()) {
//             this.val.showAllMessages();
//             return;
//         }

//         application_service.save(this.app);
//     }
// }
