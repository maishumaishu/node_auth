import { settings } from 'site';
import { Dialog } from 'controls';

export default function (page: chitu.Page) {
    page.element.innerHTML = "hello world";
    class UrlSettingsPage extends React.Component<{}, {}>{
        private settingsTable: HTMLTableElement;
        private dialog: Dialog;
        componentDidMount() {
            let dataSource = new wuzhui.ArrayDataSource([
                { name: '前端接口', url: '', groups: ['user', 'seller'] },
                { name: '后台接口', url: '', groups: ['admin'] }
            ])
            let component = this;
            let gridView = new wuzhui.GridView({
                element: this.settingsTable, dataSource,
                columns: [
                    new wuzhui.BoundField({ dataField: 'name', headerText: '名称' }),
                    new wuzhui.BoundField({ dataField: 'url', headerText: '连接' }),
                    new wuzhui.CustomField({
                        createItemCell(dataItem) {
                            let cell = new wuzhui.GridViewCell(this);
                            let deleteButton = document.createElement('button');
                            deleteButton.className = 'btn btn-minier btn-danger';
                            deleteButton.innerHTML = '<i class="icon-trash"></i>';

                            let editButton = document.createElement('button');
                            editButton.className = 'btn btn-info btn-minier';
                            editButton.innerHTML = '<i class="icon-pencil"></i>';
                            editButton.style.marginRight = '4px';
                            editButton.onclick = function () {
                                component.dialog.show();
                            }


                            cell.appendChild(editButton);
                            cell.appendChild(deleteButton);

                            return cell;
                        },
                        headerStyle: { width: '100px', textAlign: 'center' } as CSSStyleDeclaration,
                        itemStyle: { textAlign: 'center' } as CSSStyleDeclaration,
                        headerText: '操作'
                    })
                ]
            });

            dataSource.select();
        }
        closeDialog() {
            this.dialog.hide();
        }
        render() {
            return (
                <div>
                    <table className={settings.tableClassName} ref={(o: HTMLTableElement) => this.settingsTable = o}>
                    </table>
                    <Dialog ref={o => this.dialog = o}
                        header={
                            <div>
                                <button onClick={() => this.closeDialog()} type="button" className="close"><span>&times;</span></button>
                                <h4 class="modal-title">&nbsp;</h4>
                            </div>
                        }
                        content={
                            <form className="form-horizontal" style={{ paddingLeft: 20, paddingRight: 20 }}>
                                <div className="form-group">
                                    <label className="control-label" style={{ float: 'left' }}>URL</label>
                                    <div style={{ marginLeft: 100 }}>
                                        <input type="text" className="form-control" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="control-label" style={{ float: 'left' }}>用户组</label>
                                    <div style={{ marginLeft: 100 }}>
                                        <input type="text" className="form-control" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="control-label" style={{ float: 'left' }}>备注</label>
                                    <div style={{ marginLeft: 100 }}>
                                        <input type="text" className="form-control" />
                                    </div>
                                </div>
                            </form>
                        }
                        footer={
                            <div>
                                <button onClick={() => this.dialog.hide()} className="btn btn-default">取消</button>
                                <button type="button" className="btn btn-primary">确定</button>
                            </div>
                        }
                    />
                </div>
            );
        }
    }

    ReactDOM.render(<UrlSettingsPage />, page.element);
}