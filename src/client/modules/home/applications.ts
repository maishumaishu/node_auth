import * as application_service from 'services/application_service';
import * as validation from 'knockout.validation';
import * as mapping from 'knockout.mapping';

class ApplicationsPage extends chitu.Page {
    private app = {
        id: ko.observable<number>(),
        name: ko.observable<string>().extend({ required: { message: '请输入应用名称' } }),
        targetUrl: ko.observable<string>().extend({ required: { message: '请输入转发的目标URL' } }),
    };

    private val: KnockoutValidationErrors;
    private $dialog: JQuery;

    constructor(params) {
        super(params);

        this.items = ko.observableArray<application_service.Application>();
        ko.applyBindings(this, this.element);

        this.load.add(this.page_load);
        this.val = validation.group(this.app);
        this.$dialog = $(this.element).find('[name="dlg_application"]');
    }

    private page_load(sender: chitu.Page, args) {
        return application_service.list().done((data: Array<any>) => {
            for(let item of data)
                item.targetUrl = '';
                
            this.items(data);
        })
    }

    //==========================================================
    // 绑定
    private items: KnockoutObservableArray<application_service.Application>;

    private newApp = () => {
        let keys = ['id', 'name', 'targetUrl'];
        for (let key of keys) {
            this.app[key](null);
        }
        this.val.showAllMessages(false);
        (<any>this.$dialog).modal();
    }

    private editApp = (item: application_service.Application) => {
        mapping.fromJS(item, {}, this.app);
        this.val.showAllMessages(false);
        (<any>this.$dialog).modal();
    }

    private saveApp = () => {
        if (!this.app['isValid']()) {
            this.val.showAllMessages();
            return;
        }
        application_service.save(mapping.toJS(this.app));
    }
    //==========================================================
}

export default ApplicationsPage;