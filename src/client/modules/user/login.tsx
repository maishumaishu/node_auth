// import { default as userService } from 'services/user';
import { app } from 'application';
// import { default as site } from 'site';
import { FormValidator } from 'formValidator';
import * as userService from 'services/userService';
import * as ui from 'ui';

requirejs(['css!modules/user/login'])
export default async function (page: chitu.Page) {
    class LoginPage extends React.Component<{}, {}>{
        validator: FormValidator;
        element: HTMLElement;
        usernameInput: HTMLInputElement;
        passwordInput: HTMLInputElement;
        componentDidMount() {
            this.validator = new FormValidator(this.element, {
                username: { rules: ['required'], display: '用户名' },
                password: { rules: ['required'], display: '密码' }
            })
        }
        login() {
            if (!this.validator.validateForm()) {
                return Promise.resolve();
            }

            let username = this.usernameInput.value;
            let password = this.passwordInput.value;
            return userService.login(username, password).then(() => {
                // let redirect_url = 'index.html#home/index'
                // location.href = redirect_url;
                app.redirect('home/index');
            });
        }
        render() {
            return (
                <div className="form-horizontal container"
                    ref={(e: HTMLElement) => this.element = e || this.element}>
                    <div className="form-group title ">
                        用户登录
                    </div>
                    <div className="form-group" >
                        <label className="col-sm-2 control-label">用户名</label>
                        <div className="col-sm-10" >
                            <input name="username" type="text" className="form-control"
                                ref={(e: HTMLInputElement) => this.usernameInput = e || this.usernameInput} />
                        </div>
                    </div>
                    <div className="form-group" >
                        <label className="col-sm-2 control-label">密码</label>
                        <div className="col-sm-10">
                            <input type="password" name="password" className="form-control"
                                ref={(e: HTMLInputElement) => this.passwordInput = e || this.passwordInput} />
                        </div>
                    </div>
                    <div className="form-group" >
                        <div className="col-sm-offset-2 col-sm-10" >
                            <button type="button" className="btn btn-primary btn-block"
                                ref={(e: HTMLButtonElement) => {
                                    if (!e) return;
                                    e.onclick = ui.buttonOnClick(() => this.login());
                                }}>
                                <i className="icon-key"></i>
                                立即登录
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10" >
                            <div className="pull-left" >
                                <a href="#user/forgetPassword" > 忘记密码 </a>
                            </div>
                            <div className="pull-right" >
                                <a href="#user/register" > 注册 </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    ReactDOM.render(<LoginPage />, page.element);
}

