export default function (page: chitu.Page) {
    let loadPromise = new Promise((reslove, reject) => {
        //page.load.add(() => reslove());
        requirejs([`text!${page.routeData.actionPath}.html`, `c!css/${page.routeData.actionPath}.css`],
            (html: string) => {
                page.element.innerHTML = html;
                reslove();
            }
        );
    });
};