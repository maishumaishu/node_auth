
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

