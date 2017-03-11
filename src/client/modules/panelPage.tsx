import { default as menuItems, MenuItem } from 'menus';
import * as app from 'application';

class SiteBar extends React.Component<{ menuItems: MenuItem[] }, {}>{
    private element: HTMLElement;

    constructor(props) {
        super(props);

        let activeItem = this.findActiveTopItem();
        this.state = { activeItem };
    }
    findActiveTopItem() {
        let items = this.props.menuItems;
        for (let i = 0; i < items.length; i++) {
            if (items[i].name == app.currentPage.name) {
                return items[i];
            }

            let children = items[i].children || [];
            for (let j = 0; j < children.length; j++) {
                if (children[j].name == app.currentPage.name) {
                    return items[i];
                }
            }
        }

        return null;
    }
    toggleElement(element: HTMLElement) {
        var activeElement = this.element.querySelector('li.active') as HTMLElement;
        if (activeElement != element && activeElement != null) {
            activeElement.className = '';
        }

        if (element.className == 'active') {
            element.className = '';
        }
        else {
            element.className = 'active';
        }
    }
    componentDidMount() {
    }
    render() {
        let items = this.props.menuItems;
        let activeElement = this.findActiveTopItem();
        return (
            <ul ref={(o) => this.element = o} className="nav nav-list">
                {items.map((o, i) => (
                    <li key={o.name} className={o == activeElement ? 'active' : ''}
                        ref={(e: HTMLElement) => {
                        }}>
                        <a name={o.name} className="dropdown-toggle" href='javascript:'
                            ref={(e) => {
                                if (!e) return;
                                e.onclick = () => {
                                    if (o.url)
                                        app.redirect(o.url);
                                    else {
                                        this.toggleElement(e.parentElement);
                                    }
                                }
                            }} >
                            <i className={o.icon}></i>
                            <span className="menu-text">{o.title}</span>
                            <b className="arrow icon-angle-down" style={{ display: o.children == null ? 'none' : 'block' }}></b>
                        </a>
                        {(o.children || []).length > 0 ?
                            <ul className="submenu">
                                {o.children.map(c => (
                                    <li key={c.name}>
                                        <a name={c.name} className={"dropdown-toggle"} href="javascript:"
                                            onClick={() => {
                                                if (c.url)
                                                    app.redirect(c.url);
                                            }}>
                                            <i className="icon-double-angle-right"></i>
                                            <i className={"menu-icon " + (c.icon ? c.icon : '')}></i>
                                            <span className="menu-text">{c.title}</span>
                                            {(c.children || []).length > 0 ? <b className="arrow icon-angle-down"></b> : null}
                                        </a>
                                    </li>
                                ))}
                            </ul> :
                            null
                        }
                    </li>
                ))}
            </ul>
        );
    }
}

export class PanelPage<P, S> extends React.Component<P, S> {
    private activeElement: HTMLElement;

    constructor(props) {
        super(props)
        this.state = {} as S;
    }
    private pareeUrlQuery(query): any {
        let match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
        let urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
        return urlParams;
    }

    renderMain() {

    }
    renderSideBar() {
        return (
            <div className="sidebar">
                <SiteBar menuItems={menuItems()} />
            </div>
        );
    }
    render() {
        return (
            <div>
                <div className="navbar navbar-default" id="navbar">
                    <div className="navbar-container" id="navbar-container">
                        <div name="userBar" className="navbar-header pull-right" role="navigation">
                            <ul className="nav ace-nav">
                                <li style={{ width: 120 }}>
                                    <a href="#user/login?logout=true"><i className="icon-off"></i> 退出</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>


                <div className="main-container" id="main-container">
                    <div className="main-container-inner">
                        <a className="menu-toggler" id="menu-toggler" href="#">
                            <span className="menu-text"></span>
                        </a>

                        {this.renderSideBar()}

                        <div className="main-content">
                            <div className="breadcrumbs" id="breadcrumbs">
                                <ul className="breadcrumb">
                                    <li>
                                        <i className="icon-home home-icon"></i>
                                        <a href="#Home/Index">首页</a>
                                    </li>
                                    <li className="active">
                                        <span data-bind="html:$data"></span>
                                    </li>
                                </ul>
                            </div>
                            <div id="mainContent" className="page-content">
                                {this.renderMain()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}