import { PanelPage } from 'modules/panelPage';
export default function (page: chitu.Page) {
    class Page extends PanelPage<{}, {}> {
        renderMain() {
            return (
                <div></div>
            );
        }
    }

    ReactDOM.render(<Page />, page.element);
}