class UrlSettingPage extends chitu.Page {
    constructor(params) {
        super(params);

        let dataSource = new wuzhui.ArrayDataSource([]);
        let gridViewElement = document.createElement('table');
        this.element.appendChild(gridViewElement);
        let gridView = new wuzhui.GridView({
            dataSource: dataSource,
            element: gridViewElement,
            columns: [
                new wuzhui.CommandField({ headerText: 'URL' }),
                new wuzhui.CommandField({ headerText: '用户组' }),
                new wuzhui.CommandField({ headerText: '操作' })
            ]
        })
    }
}

export = UrlSettingPage;