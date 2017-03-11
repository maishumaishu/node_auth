import { PanelPage } from 'modules/panelPage';

export default function (page: chitu.Page) {
    let loadPromise = new Promise((reslove, reject) => {
        requirejs([`c!css/${page.routeData.actionPath}.css`],
            (html: string) => {

            }
        );
    });

    class Page extends PanelPage<{}, {}> {
        renderMain() {
            return (
                <div>
                </div>
            );
        }
    }

    ReactDOM.render(<Page />, page.element);

};