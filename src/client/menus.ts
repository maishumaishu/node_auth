import * as app from 'application';

export interface MenuItem {
    name: string,
    title: string,
    icon: string,
    url: string,
    children: MenuItem[]
}


export default function () {
    let appId = app.currentPage.routeData.values.appId;
    let menus: MenuItem[] = [
        {
            name: 'home.users',
            title: "用户列表",
            icon: "icon-bullhorn",
            url: `home/users?appId=${appId}`
        } as MenuItem,
        {
            name: 'urlSetting',
            title: 'URL设置',
            icon: 'icon-bullhorn',
            children: [
                {
                    name: 'permission.urlSetting',
                    title: "URL拦截",
                    url: `permission/urlSetting?appId=${appId}`
                } as MenuItem,
                {
                    name: 'home.redirect',
                    title: 'URL转发',
                    url: `home/redirect?appId=${appId}`
                } as MenuItem
            ]
        } as MenuItem
    ];

    return menus;
};