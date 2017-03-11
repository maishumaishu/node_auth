export function getChildren(props: React.Props<any>): Array<any> {
    props = props || {};
    let children = [];
    if (props.children instanceof Array) {
        children = props.children as Array<any>;
    }
    else if (props['children'] != null) {
        children = [props['children']];
    }
    return children;
}

interface DialogProps extends React.Props<Dialog> {
    footer?: JSX.Element,
    content?: JSX.Element,
    header?: JSX.Element,
}

interface DialogState {
    //content?: string
}

export class Dialog extends React.Component<DialogProps, DialogState>{
    private animateTime = 400;//ms
    private element: HTMLElement;
    private dialogElement: HTMLElement;

    constructor(props) {
        super(props);

        this.state = {};
    }

    show() {
        this.element.style.display = 'block';
        this.dialogElement.style.transform = `translateY(-${this.dialogElement.getBoundingClientRect().height}px)`;
        setTimeout(() => this.dialogElement.style.transform = `translateY(${100}px)`, 50);
    }

    hide() {
        this.dialogElement.style.transform = `translateY(-${this.dialogElement.getBoundingClientRect().height}px)`;
        setTimeout(() => this.element.style.display = 'none', this.animateTime);
    }

    componentDidMount() {
        this.dialogElement.style.transition = `${this.animateTime / 1000}s`;
    }
    render() {
        let content = this.props.content;
        return (
            <div ref={(o: HTMLElement) => this.element = o} style={{ display: 'none' }}>
                <div ref={(o: HTMLElement) => this.dialogElement = o} className="modal" style={{ display: 'block', transform: 'translateY(-10000px)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            {(this.props.header ?
                                <div className="modal-header">
                                    {this.props.header}
                                </div> : null)}
                            <div className="modal-body">
                                {/*<h5 dangerouslySetInnerHTML={{ __html: this.state.content }}></h5>*/}
                                {content}
                            </div>
                            {(this.props.footer ?
                                <div className="modal-footer">
                                    {this.props.footer}
                                </div> : null)}
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop in"></div>
            </div>
        );
    }
}

interface ButtonProps extends React.Props<Button> {
    onClick?: (event: React.MouseEvent) => Promise<any>,
    confirm?: string,
    className?: string,
    style?: React.CSSProperties,
    disabled?: boolean,
}

function findPageView(p: HTMLElement): HTMLElement {
    while (p) {
        let attr = p.getAttribute('data-reactroot');
        if (attr != null) {
            return p;
        }

        p = p.parentElement;
    }

    return null;
}

export class Button extends React.Component<ButtonProps, {}>{

    private buttonElement: HTMLButtonElement;
    private _doing: boolean;
    //private confirmDialog: ConfirmDialog;
    private dialogElement: HTMLElement;
    private animateTime: number;
    private currentClickEvent: React.MouseEvent;

    private onClick(e: React.MouseEvent) {
        this.currentClickEvent = e;
        if (this.props.onClick == null) {
            return;
        }

        if (this.doing)
            return;

        if (this.props.confirm) {
            this.showDialog();
        }
        else {
            this.execute(e);
        }
    }

    private showDialog() {
        this.dialogElement.parentElement.style.display = 'block';
        this.dialogElement.style.transform = `translateY(-${this.dialogElement.getBoundingClientRect().height}px)`;
        setTimeout(() => this.dialogElement.style.transform = `translateY(${100}px)`, 50);
    }

    private hideDialog() {
        this.dialogElement.style.transform = `translateY(-${this.dialogElement.getBoundingClientRect().height}px)`;
        setTimeout(() => this.dialogElement.parentElement.style.display = 'none', this.animateTime);
    }

    private execute(e) {
        let result = this.props.onClick(e) as Promise<any>;
        this.doing = true;
        if (result == null || result.catch == null || result.then == null) {
            this.doing = false;
            return;
        }

        result.then(o => {
            this.doing = false;
        }).catch(o => {
            this.doing = false;
        })

        return result;
    }

    private get doing() {
        return this._doing;
    }
    private set doing(value: boolean) {
        this._doing = value;
        if (value) {
            this.buttonElement.disabled = true;
        }
        else {
            this.buttonElement.disabled = false;
        }
    }
    private componentDidMount() {
    }

    private cancel() {
        this.hideDialog();
    }

    private ok() {
        let result = this.execute(this.currentClickEvent);
        if (result instanceof Promise) {
            result.then(() => this.hideDialog())
        }
        else {
            this.hideDialog();
        }
    }

    private renderConfirmDialog() {

    }

    render() {
        // debugger;
        let children = getChildren(this.props);
        return (
            <span>
                <button ref={(o: HTMLButtonElement) => this.buttonElement = o}
                    onClick={(e) => this.onClick(e)} className={this.props.className}
                    style={this.props.style} disabled={this.props.disabled}>
                    {children.map(o => (o))}
                </button>
                <div style={{ display: 'none' }}>
                    <div ref={(o: HTMLElement) => this.dialogElement = o} className="modal"
                        style={{ display: 'block', transform: 'translateY(-10000px)', transition: `${this.animateTime / 1000}s` }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-body text-left">
                                    <h5 dangerouslySetInnerHTML={{ __html: this.props.confirm }}></h5>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => this.cancel()} className="btn btn-default">取消</button>
                                    <button type="button" onClick={() => this.ok()} className="btn btn-primary">确认</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop in"></div>
                </div>
            </span>
        );
    }
}
