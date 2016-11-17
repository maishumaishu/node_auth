import * as application_service from 'services/application_service';
import * as validation from 'knockout.validation';
import * as mapping from 'knockout.mapping';

//let app_fields = ['id', 'name', 'targetUrl'];
class ApplicationsPage {

    private app: application_service.Application;

    private val: KnockoutValidationErrors;
    private $dialog: JQuery;

    constructor(page: chitu.Page) {

        this.app = new application_service.Application();
        this.app.name.extend({ required: { message: '请输入应用名称' } });
        this.app.targetUrl.extend({ required: { message: '请输入转发的目标URL' } });

        this.items = ko.observableArray<application_service.Application>();

        page.load.add(() => this.page_load(page));
    }

    private page_load(sender: chitu.Page) {
        ko.applyBindings(this, sender.element);
        this.val = validation.group(this.app);
        this.$dialog = $(sender.element).find('[name="dlg_application"]');
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