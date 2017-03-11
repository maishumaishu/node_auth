import { PanelPage } from 'modules/panelPage';
import { settings } from 'site';
import { appToken, host } from 'services/service'
export default function (page: chitu.Page) {
    let appId = page.routeData.values.appId;
    class Page extends PanelPage<{}, {}> {
        private tableElement: HTMLTableElement;
        componentDidMount() {
            let dataSource = new wuzhui.WebDataSource({
                selectUrl: `${host}adminUser/list?application-token=${appToken}&appId=${appId}`
            });
            let gridView = new wuzhui.GridView({
                element: this.tableElement,
                columns: [
                    new wuzhui.BoundField({ dataField: 'mobile' })
                ],
                dataSource
            });
            dataSource.select();
        }
        renderMain() {
            return (
                <div>
                    <table className={settings.tableClassName}
                        ref={(o) => this.tableElement = o}>
                    </table>
                </div>
            )
        }
    }

    ReactDOM.render(<Page />, page.element);
};