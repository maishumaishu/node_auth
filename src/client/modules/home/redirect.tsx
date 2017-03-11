import { settings } from 'site';
import { PanelPage } from 'modules/panelPage';
import * as appService from 'services/applicationService';
import { Dialog, Button } from 'controls';
// import * as  FormValidator from 'commom/formValidator';

export default function (page: chitu.Page) {
    var appId = page.routeData.values.appId;

    class PageComponent extends PanelPage<{}, { items: appService.RedirectInfo[], requestUrl: string, targetUrl: string }>{
        private table: HTMLTableElement;
        private dialog: Dialog;
        private app: appService.Application;

        constructor(props) {
            super(props);
            appService.get(appId).then(o => {
                this.state.items = o.redirects || [];
                this.setState(this.state);
                this.app = o;
            })
        }
        componentDidMount() {
        }
        showDialog() {
            this.dialog.show();
        }
        addItem() {

            let item = {
                urlPattern: this.state.requestUrl,
                target: this.state.targetUrl
            } as appService.RedirectInfo;


            this.state.items.push(item);
            this.app.redirects = this.state.items;
            return appService.save(this.app).then(o => {
                this.setState(this.state);
            })
        }
        renderMain() {
            let items = this.state.items || [];
            return (
                <div>
                    <div className="pull-right">
                        <button className="btn btn-sm btn-primary" onClick={() => this.showDialog()}>添加</button>
                    </div>
                    <table className={settings.tableClassName} ref={(o: HTMLTableElement) => this.table = o}>
                        <thead>
                            <tr>
                                <td style={{ width: 200, textAlign: 'center' }}>请求路径</td>
                                <td style={{ textAlign: 'center' }}>目标地址</td>
                                <td style={{ width: 100, textAlign: 'center' }}>操作</td>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ?
                                items.map((o, i) => (
                                    <tr key={i}>
                                        <td>{o.urlPattern}</td>
                                        <td>{o.target}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Button className="btn btn-minier btn-danger"
                                                confirm={"确定要删除该记录吗？"}
                                                onClick={() => {
                                                    this.state.items = this.state.items.filter((element, index) => index != i);
                                                    this.app.redirects = this.state.items;
                                                    return appService.save(this.app).then(() => {
                                                        this.setState(this.state);
                                                    });
                                                }}>
                                                <i className="icon-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                )) :
                                <tr className="empty">
                                    <td colSpan={3}>
                                        暂无记录
                                    </td>
                                </tr>}
                        </tbody>

                    </table>
                    <Dialog ref={o => this.dialog = o}
                        header={
                            <div>
                                <button onClick={() => this.dialog.hide()} type="button" className="close"><span>&times;</span></button>
                                <h4 className="modal-title">&nbsp;</h4>
                            </div>
                        }
                        content={
                            <form className="form-horizontal" style={{ paddingLeft: 20, paddingRight: 20 }}>
                                <div className="form-group">
                                    <label className="control-label" style={{ float: 'left' }}>请求路径</label>
                                    <div style={{ marginLeft: 100 }}>
                                        <input type="text" className="form-control" placeholder="请输入请求URL的匹配"
                                            value={this.state.requestUrl}
                                            onChange={(e) => {
                                                if (!e) return;
                                                this.state.requestUrl = (e.target as HTMLInputElement).value;
                                                this.setState(this.state);
                                            }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="control-label" style={{ float: 'left' }}>目标地址</label>
                                    <div style={{ marginLeft: 100 }}>
                                        <input type="text" className="form-control" placeholder="请输入转发的目标URL"
                                            value={this.state.targetUrl}
                                            onChange={(e) => {
                                                if (!e) return;
                                                this.state.targetUrl = (e.target as HTMLInputElement).value;
                                                this.setState(this.state);
                                            }}
                                        />
                                    </div>
                                </div>
                            </form>
                        }
                        footer={
                            <div>
                                <button className="btn btn-default"
                                    onClick={() => this.dialog.hide()}>取消</button>
                                <Button className="btn btn-primary"
                                    onClick={() => {
                                        return this.addItem().then(() => {
                                            this.dialog.hide();
                                        });
                                    }}>确定</Button>
                            </div>
                        }
                    />
                </div>
            );
        }
    }

    ReactDOM.render(<PageComponent />, page.element);

}