import { PanelPage } from 'modules/panelPage';
import { settings } from 'site';
import { appkey, host } from 'services/service';
import * as userService from 'services/userService';

export default function (page: chitu.Page) {
    let appId = page.routeData.values.appId;
    class Page extends PanelPage<{}, {}> {
        private tableElement: HTMLTableElement;
        private pagingbarElement: HTMLElement;

        componentDidMount() {
            let dataSource = new wuzhui.WebDataSource({
                select: (args) => userService.list(args)
            });
            let gridView = new wuzhui.GridView({
                element: this.tableElement,
                columns: [
                    new wuzhui.BoundField({ dataField: 'mobile', headerText: '手机' }),
                    new wuzhui.BoundField({ dataField: 'createDateTime', headerText: '注册日期' })
                ],
                dataSource
            });

            let pagingbar = new wuzhui.NumberPagingBar({
                dataSource: dataSource, element: this.pagingbarElement,
                createButton: function () {
                    let button = document.createElement('a');
                    let li = document.createElement('li');
                    li.appendChild(button);
                    button.href = 'javascript:';
                    $(this.element).find('.pagination').append(li);
                    let result = {
                        get visible(): boolean {
                            return $(li).is(':visible');
                        },
                        set visible(value: boolean) {
                            if (value)
                                $(li).show();
                            else
                                $(li).hide();
                        },
                        get pageIndex(): number {
                            return new Number($(button).attr('pageIndex')).valueOf();
                        },
                        set pageIndex(value: number) {
                            $(button).attr('pageIndex', value);
                        },
                        get text(): string {
                            return button.innerHTML;
                        },
                        set text(value) {
                            button.innerHTML = value;
                        },
                        get active(): boolean {
                            return $(li).hasClass('active');
                        },
                        set active(value: boolean) {
                            if (value == true) {
                                $(li).addClass('active');
                            }
                            else {
                                $(li).removeClass('active');
                            }
                        }
                    } as wuzhui.NumberPagingButton;
                    $(button).click(() => {
                        if (result.onclick) {
                            result.onclick(result, pagingbar);
                        }
                    })
                    return result;
                },
                createTotal: function () {
                    let totalElement = document.createElement('span');
                    totalElement.className = 'total';

                    let textElement = document.createElement('span');
                    textElement.className = 'text';
                    textElement.innerHTML = '总记录：';
                    totalElement.appendChild(textElement);

                    let numberElement = document.createElement('span');
                    numberElement.className = 'number';
                    totalElement.appendChild(numberElement);

                    $(this.element).find('.pull-left').append(totalElement);
                    return {
                        get text(): string {
                            return numberElement.innerHTML;
                        },
                        set text(value: string) {
                            numberElement.innerHTML = value;
                        },
                        get visible(): boolean {
                            return $(totalElement).is(':visible');
                        },
                        set visible(value: boolean) {
                            if (value == true)
                                $(totalElement).show();
                            else
                                $(totalElement).hide();
                        }
                    } as wuzhui.PagingTotalLabel;
                }
            });

            dataSource.select();
        }
        renderMain() {
            return (
                <div>
                    <div className="dataTables_wrapper form-inline no-footer">
                        <table className={settings.tableClassName}
                            ref={(o) => this.tableElement = o}>
                        </table>
                        <div ref={(o) => this.pagingbarElement = o}>
                            <div className="pull-left"></div>
                            <div className="dataTables_paginate paging_simple_numbers pull-right">
                                <nav>
                                    <ul className="pagination">

                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    ReactDOM.render(<Page />, page.element);
};