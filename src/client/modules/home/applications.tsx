import * as app_service from 'services/applicationService';
import { Application } from 'services/applicationService';
import { BasePage } from 'modules/basePage';

export default function action(page: chitu.Page) {

    // let loadPromise = new Promise((reslove, reject) => {
    //page.load.add(() => reslove());
    requirejs([`text!${page.routeData.actionPath}.html`, `css!${page.routeData.actionPath}`],
        // (html: string) => {
        //     let section = document.createElement('section');
        //     section.innerHTML = html;
        //     page.element.appendChild(section);
        //     reslove();
        // }
    );
    // });

    class PageComponent extends BasePage<React.Props<PageComponent>, { items: Application[] }>{
        private dialogElement: HTMLElement;
        private validator: FormValidator;

        constructor(props) {
            super(props);
            this.state = { items: [] };
            app_service.list().then(items => {
                this.state.items = items;
                this.setState(this.state);
            })
            this.validator = new FormValidator(this.dialogElement, [
                { name: '编号', rules: 'required' },
                { name: '名称', rules: 'required' },
                { name: '端口', rules: 'required' },
                { name: '目标URL', rules: 'required' }
            ]);
        }
        editApp(item: Application) {

            //currentItem = item;
            // Object.assign(data.app, item);

            /*let element = this.$el as HTMLElement;
            validator.clearErrors();
            (<any>$(dialogElement)).modal();
                }
        saveApp(app: Application) {
            if (!this.validator.validateForm()) {
                return;
            }*/

            // app_service.save(app).then((result) => {
            //     if (app._id == null) {
            //         this.state.items.push(app);
            //     }
            //     else {
            //         // let editItem = data.items.filter(o => o._id == data.app._id)[0];
            //         // Object.assign(editItem, data.app);
            //     }
            //     });
        }
        newApp() {

        }
        newToken(item: Application) {
        }
        renderSidebar() {
            return null;
        }
        renderMain() {
            let items = this.state.items;
            return (
                <div className="home_applications">
                    <ul className="apps">
                        {items.map(o => (
                            <li key={o._id}>
                                <div className="header">
                                    <p className="smaller lighter green">
                                        {o.name}
                                    </p>
                                </div>
                                <div className="body">

                                    <div>
                                        <div className="pull-left">
                                            编号
					                    </div>
                                        <div className="text interception">
                                            {o._id}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="pull-left">
                                            令牌
					                    </div>
                                        <div onClick={() => this.newToken(o)} className="text interception">
                                            {o.token == null ? '点击生成令牌' : o.token}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="pull-left">
                                            名称
					                    </div>
                                        <div className="text interception">
                                            {o.name}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="pull-left">
                                            转发至
					                    </div>
                                        <div className="text interception">
                                            {o.targetUrl}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="pull-left">
                                            开放注册
					                    </div>
                                        <div className="text interception">
                                        </div>

                                    </div>
                                </div>
                                <div className="footer">
                                    <div className="col-xs-6">
                                        <button onClick={() => { }} className="btn btn-primary btn-block">编辑</button>
                                    </div>
                                    <div className="col-xs-6">
                                        <a href={`#user/users?appId=${o._id}`} className="btn btn-success btn-block">详细</a>
                                    </div>
                                </div>
                            </li>
                        ))}
                        <li>
                            <div className="header">
                                <p className="smaller lighter green">
                                    添加应用
                                </p>
                            </div>
                            <div onClick={() => this.newApp()} className="add">
                                <i className="icon-plus" style={{ fontSize: 120 }}></i>
                            </div>
                        </li>
                    </ul >
                    <div className="modal fade" ref={(o: HTMLElement) => this.dialogElement = o}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                    <h4 className="modal-title">添加应用</h4>
                                </div>

                                <div className="modal-body">
                                    <form className="form-horizontal" role="form">
                                        <div className="form-group">
                                            <label className="col-sm-2 control-label">名称</label>
                                            <div className="col-sm-10">
                                                <input name="名称" type="text" className="form-control" placeholder="请输入应用名称" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-2 control-label">转发至</label>
                                            <div className="col-sm-10">
                                                <input name="目标URL" type="text" className="form-control" placeholder="请输入转发的目标URL" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-sm-offset-2 col-sm-10">
                                                <div className="checkbox">
                                                    <label>
                                                        <input type="checkbox" /> 开放注册接口
								                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" data-dismiss="modal">取消</button>
                                    <button type="button" className="btn btn-primary">确定</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div >
            );
        }
    }

    ReactDOM.render(<PageComponent />, page.element);

    // let self = this;
    // Promise.all([app_service.list(), loadPromise]).then((results) => {
    //     let items = results[0];

    //     let data = { items, app: new Application() };
    //     let vm = new Vue({
    //         el: page.element.children[0] as HTMLElement,
    //         data,
    //         methods: {
    //             editApp: function (item: Application) {

    //                 //currentItem = item;
    //                 Object.assign(data.app, item);

    //                 let element = this.$el as HTMLElement;
    //                 validator.clearErrors();
    //                 (<any>$(dialogElement)).modal();
    //             },
    //             saveApp: function () {
    //                 if (!validator.validateForm()) {
    //                     return;
    //                 }

    //                 app_service.save(data.app).then((result) => {
    //                     if (data.app._id == null) {
    //                         data.items.push();
    //                     }
    //                     else {
    //                         let editItem = data.items.filter(o => o._id == data.app._id)[0];
    //                         Object.assign(editItem, data.app);
    //                     }
    //                 });
    //             },
    //             newApp: function () {
    //                 Object.assign(data.app, new Application());
    //                 validator.clearErrors();
    //                 (<any>$(dialogElement)).modal();
    //             },
    //             newToken: function (item: Application) {

    //             }
    //         }
    //     });

    //     let dialogElement = vm.$el.querySelector('[name="dlg_application"]') as HTMLElement;
    //     console.assert(dialogElement != null);
    //     let validator = new FormValidator(dialogElement, [
    //         { name: '编号', rules: 'required' },
    //         { name: '名称', rules: 'required' },
    //         { name: '端口', rules: 'required' },
    //         { name: '目标URL', rules: 'required' }
    //     ]);
    // });
}



