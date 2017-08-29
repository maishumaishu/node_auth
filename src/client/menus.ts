import { app } from 'application';

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
            name: 'user.users',
            title: "用户列表",
            icon: "icon-bullhorn",
            url: `user/users?appId=${appId}`
        } as MenuItem,
        {
            name: 'urlSetting',
            title: 'URL设置',
            icon: 'icon-bullhorn',
            children: [
                {
                    name: 'url.urlSetting',
                    title: "URL拦截",
                    url: `url/urlSetting?appId=${appId}`
                } as MenuItem,
                {
                    name: 'url.redirect',
                    title: 'URL转发',
                    url: `url/redirect?appId=${appId}`
                } as MenuItem
            ]
        } as MenuItem,
        {
            name: 'log.request',
            title: '请求日志',
            icon: 'icon-bullhorn',
            url: `log/request?appId=${appId}`
        } as MenuItem
    ];

    return menus;
};