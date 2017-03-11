export class BasePage<P, S> extends React.Component<P, S>{
    renderMain() {

    }
    render() {
        return (
            <div>
                <div className="navbar navbar-default">
                    <div className="navbar-container">
                        <div name="userBar" className="navbar-header pull-right" role="navigation">
                            <ul className="nav ace-nav">
                                <li style={{ width: 120 }}>
                                    <a href="#user/login?logout=true"><i className="icon-off"></i> 退出</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="main-container">
                    <div className="main-container-inner">
                        {this.renderMain()}
                    </div>
                </div>
            </div>
        );
    }
}