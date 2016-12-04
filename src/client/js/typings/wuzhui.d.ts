declare namespace wuzhui {
    class Control<T extends HTMLElement> {
        private _text;
        private _visible;
        private _element;
        constructor(element: T);
        html: string;
        visible: boolean;
        readonly element: T;
        appendChild(child: Control<any> | HTMLElement): void;
        style(value: CSSStyleDeclaration | string): void;
        static getControlByElement(element: HTMLElement): Control<any>;
    }
}
declare namespace wuzhui {
    interface DataSourceSelectResult<T> {
        totalRowCount: number;
        dataItems: Array<T>;
    }
    abstract class DataSource<T> {
        private _currentSelectArguments;
        protected primaryKeys: string[];
        inserting: Callback<DataSource<T>, {
            item: any;
        }>;
        inserted: Callback<DataSource<T>, {
            item: any;
        }>;
        deleting: Callback<DataSource<T>, {
            item: any;
        }>;
        deleted: Callback<DataSource<T>, {
            item: any;
        }>;
        updating: Callback<DataSource<T>, {
            item: any;
        }>;
        updated: Callback<DataSource<T>, {
            item: any;
        }>;
        selecting: Callback<DataSource<T>, {
            selectArguments: DataSourceSelectArguments;
        }>;
        selected: Callback<DataSource<T>, {
            selectArguments: DataSourceSelectArguments;
            items: any[];
        }>;
        constructor(primaryKeys: string[]);
        readonly selectArguments: DataSourceSelectArguments;
        protected executeInsert(item: T): JQueryPromise<any>;
        protected executeDelete(item: T): JQueryPromise<any>;
        protected executeUpdate(item: T): JQueryPromise<any>;
        protected executeSelect(args: any): JQueryPromise<Array<T> | DataSourceSelectResult<T>>;
        insert(item: any): JQueryPromise<any>;
        delete(item: any): JQueryPromise<any>;
        update(item: any): JQueryPromise<any>;
        isSameItem(theItem: T, otherItem: T): boolean;
        private checkPrimaryKeys(item);
        select(): JQueryPromise<T[] | DataSourceSelectResult<T>>;
        readonly canDelete: boolean;
        readonly canInsert: boolean;
        readonly canUpdate: boolean;
    }
    class DataSourceSelectArguments {
        startRowIndex: number;
        totalRowCount: number;
        maximumRows: number;
        sortExpression: string;
        filter: string;
        constructor();
    }
    type WebDataSourceArguments = {
        primaryKeys?: string[];
        selectUrl: string;
        insertUrl?: string;
        updateUrl?: string;
        deleteUrl?: string;
    };
    class WebDataSource<T> extends DataSource<T> {
        private args;
        constructor(args: WebDataSourceArguments);
        readonly canDelete: boolean;
        readonly canInsert: boolean;
        readonly canUpdate: boolean;
        protected executeInsert(item: T): JQueryPromise<any>;
        protected executeDelete(item: T): JQueryPromise<any>;
        protected executeUpdate(item: T): JQueryPromise<any>;
        protected executeSelect(args: any): JQueryPromise<Array<T> | DataSourceSelectResult<T>>;
        private formatData(data);
    }
    class ArrayDataSource<T> extends DataSource<T> {
        private source;
        constructor(items: Array<T>, primaryKeys?: string[]);
        protected executeInsert(item: T): JQueryPromise<any>;
        protected executeDelete(item: T): JQueryPromise<any>;
        protected executeUpdate(item: T): JQueryPromise<any>;
        protected executeSelect(args: any): JQueryPromise<Array<T> | DataSourceSelectResult<T>>;
        readonly canDelete: boolean;
        readonly canInsert: boolean;
        readonly canUpdate: boolean;
        private getPrimaryKeyValues(item);
        private findItem(pkValues);
    }
}
declare namespace wuzhui {
    class Errors {
        constructor(parameters: any);
        static notImplemented(message?: string): Error;
        static argumentNull(paramName: any): Error;
        static controllBelonsAnother(): Error;
        static columnsCanntEmpty(): Error;
        static dataSourceCanntInsert(): Error;
        static dataSourceCanntUpdate(): Error;
        static dataSourceCanntDelete(): Error;
        static primaryKeyNull(key: string): Error;
    }
}
declare namespace wuzhui {
    class GridViewCell extends Control<HTMLTableCellElement> {
        private _field;
        constructor(field: DataControlField);
        readonly field: DataControlField;
    }
    interface DataControlFieldParams {
        footerText?: string;
        headerText?: string;
        itemStyle?: string | CSSStyleDeclaration;
        headerStyle?: string | CSSStyleDeclaration;
        footerStyle?: string | CSSStyleDeclaration;
        visible?: boolean;
        sortExpression?: string;
    }
    class GridViewHeaderCell extends GridViewCell {
        private _sortType;
        private _iconElement;
        ascHTML: string;
        descHTML: string;
        sortingHTML: string;
        sorting: Callback<GridViewHeaderCell, {
            sortType: string;
        }>;
        sorted: Callback<GridViewHeaderCell, {
            sortType: string;
        }>;
        constructor(field: DataControlField);
        handleSort(): JQueryPromise<any[] | DataSourceSelectResult<any>>;
        private defaultHeaderText();
        sortType: "desc" | "asc";
        clearSortIcon(): void;
        private updateSortIcon();
    }
    class DataControlField {
        private _gridView;
        protected _params: DataControlFieldParams;
        constructor(params?: DataControlFieldParams);
        footerText: string;
        headerText: string;
        itemStyle: string | CSSStyleDeclaration;
        footerStyle: string | CSSStyleDeclaration;
        headerStyle: string | CSSStyleDeclaration;
        readonly visible: boolean;
        gridView: GridView;
        sortExpression: string;
        createHeaderCell(): GridViewCell;
        createFooterCell(): GridViewCell;
        createItemCell(dataItem: any): GridViewCell;
    }
}
declare namespace wuzhui {
    class GridViewEditableCell extends GridViewCell {
        private _dataItem;
        private _valueElement;
        private _editorElement;
        private _value;
        private _valueType;
        constructor(field: BoundField, dataItem: any);
        beginEdit(): void;
        endEdit(): void;
        cancelEdit(): void;
        value: any;
        createControl(): HTMLElement;
        setControlValue(value: any): void;
        getControlValue(): any;
        private getCellHtml(value);
        private formatValue(...args);
        private formatDate(value, format);
        private formatNumber(value, format);
    }
    interface BoundFieldParams extends DataControlFieldParams {
        dataField: string;
        dataFormatString?: string;
        controlStyle?: CSSStyleDeclaration | string;
        nullText?: string;
    }
    class BoundField extends DataControlField {
        private _sortType;
        private _valueElement;
        constructor(params: BoundFieldParams);
        private params();
        readonly nullText: string;
        createItemCell(dataItem: any): GridViewCell;
        readonly dataField: string;
        readonly dataFormatString: string;
        readonly controlStyle: string | CSSStyleDeclaration;
    }
}
declare namespace wuzhui {
    interface CommandFieldParams extends DataControlFieldParams {
        showEditButton?: boolean;
        showNewButton?: boolean;
        showDeleteButton?: boolean;
        cancelButtonHTML?: string;
        deleteButtonHTML?: string;
        editButtonHTML?: string;
        newButtonHTML?: string;
        updateButtonHTML?: string;
        insertButtonHTML?: string;
        cancelButtonClass?: string;
        deleteButtonClass?: string;
        editButtonClass?: string;
        newButtonClass?: string;
        updateButtonClass?: string;
        insertButtonClass?: string;
        handleUpdate?: () => JQueryPromise<any>;
    }
    class CommandField extends DataControlField {
        private _updating;
        private _deleting;
        constructor(params?: CommandFieldParams);
        private params();
        cancelButtonHTML: string;
        deleteButtonHTML: string;
        editButtonHTML: string;
        updateButtonHTML: string;
        newButtonHTML: string;
        insertButtonHTML: string;
        cancelButtonClass: string;
        deleteButtonClass: string;
        editButtonClass: string;
        newButtonClass: string;
        updateButtonClass: string;
        insertButtonClass: string;
        createItemCell(dataItem: any): GridViewCell;
        private createEditButton();
        private createDeleteButton();
        private createInsertButton();
        private createUpdateButton();
        private createCancelButton();
        private createNewButton();
        private on_editButtonClick(e);
        private on_cancelButtonClick(e);
        private on_updateButtonClick(e);
        private on_deleteButtonClick(e);
    }
}
declare namespace wuzhui {
    interface CustomFieldParams extends DataControlFieldParams {
        createHeaderCell?: () => GridViewCell;
        createFooterCell?: () => GridViewCell;
        createItemCell: (field: CustomField, dataItem: any) => GridViewCell;
    }
    class CustomField extends DataControlField {
        constructor(params: CustomFieldParams);
        private params();
        createHeaderCell(): GridViewCell;
        createFooterCell(): GridViewCell;
        createItemCell(dataItem: any): GridViewCell;
    }
}
declare namespace wuzhui {
    enum GridViewRowType {
        Header = 0,
        Footer = 1,
        Data = 2,
        Paging = 3,
        Empty = 4,
    }
    class GridViewRow extends Control<HTMLTableRowElement> {
        private _rowType;
        private _gridView;
        constructor(rowType: GridViewRowType);
        readonly rowType: GridViewRowType;
        readonly gridView: GridView;
        readonly cells: GridViewCell[];
    }
    class GridViewDataRow extends GridViewRow {
        private _dataItem;
        constructor(gridView: GridView, dataItem: any);
        readonly dataItem: any;
    }
    interface GridViewArguments {
        dataSource: DataSource<any>;
        columns: Array<DataControlField>;
        showHeader?: boolean;
        showFooter?: boolean;
        element?: HTMLTableElement;
        emptyDataRowStyle?: string;
    }
    class GridView extends Control<HTMLTableElement> {
        private _pageSize;
        private _selectedRowStyle;
        private _showFooter;
        private _showHeader;
        private _columns;
        private _dataSource;
        private _header;
        private _footer;
        private _body;
        private _emtpyRow;
        private _currentSortCell;
        private _params;
        static emptyRowClassName: string;
        static dataRowClassName: string;
        emptyDataText: string;
        rowCreated: Callback<GridView, {
            row: GridViewRow;
        }>;
        constructor(params: GridViewArguments);
        readonly columns: DataControlField[];
        readonly dataSource: DataSource<any>;
        private appendEmptyRow();
        private appendDataRow(dataItem);
        private on_sort(sender, args);
        private appendHeaderRow();
        private appendFooterRow();
        private on_selectExecuted(items, args);
        private on_updateExecuted(item);
        private showEmptyRow();
        private hideEmptyRow();
    }
}
declare namespace wuzhui {
    enum PagerPosition {
        Bottom = 0,
        Top = 1,
        TopAndBottom = 2,
    }
    interface PagerSettings {
        firstPageText?: string;
        lastPageText?: string;
        nextPageText?: string;
        pageButtonCount?: number;
        previousPageText?: string;
    }
    class PagingBar {
        private _pageIndex;
        private _dataSource;
        private _totalRowCount;
        private _pageSize;
        init(dataSource: DataSource<any>): void;
        readonly pageCount: number;
        pageSize: number;
        pageIndex: number;
        totalRowCount: number;
        render(): void;
    }
    interface NumberPagingButton {
        visible: boolean;
        pageIndex: number;
        text: string;
        active: boolean;
        onclick: NumberPagingButtonClickEvent;
    }
    interface PagingTotalLabel {
        text: string;
        visible: boolean;
    }
    type NumberPagingButtonClickEvent = (sender: NumberPagingButton, pagingBar: NumberPagingBar) => void;
    type PagingBarElementType = 'firstButton' | 'lastButton' | 'previousButton' | 'nextButton' | 'numberButton' | 'totalLabel';
    class NumberPagingBar extends PagingBar {
        private dataSource;
        private pagerSettings;
        private element;
        private totalElement;
        private numberButtons;
        private firstPageButton;
        private previousPageButton;
        private nextPageButton;
        private lastPageButton;
        private createLabel;
        private createButton;
        constructor(params: {
            dataSource: DataSource<any>;
            element: HTMLElement;
            pagerSettings?: PagerSettings;
            createTotal?: () => PagingTotalLabel;
            createButton?: () => NumberPagingButton;
        });
        private createPagingButton();
        private createTotalLabel();
        private createPreviousButtons();
        private createNextButtons();
        private createNumberButtons();
        private static on_buttonClick(button, pagingBar);
        render(): void;
    }
}
declare namespace wuzhui {
    interface Callback<S, A> {
        add(callbacks: (sender: S, args: A) => any): Callback<S, A>;
        disable(): Callback<S, A>;
        disabled(): boolean;
        empty(): Callback<S, A>;
        fire(sender: S, args: A): Callback<S, A>;
        fired(): boolean;
        fireWith(context: any, [S, A]: [any, any]): Callback<S, A>;
        has(callback: Function): boolean;
        lock(): Callback<S, A>;
        locked(): boolean;
        remove(callbacks: Function): Callback<S, A>;
        remove(callbacks: Function[]): Callback<S, A>;
    }
    var ajaxTimeout: number;
    let ajax: (url: string, data: any) => JQueryPromise<any>;
    function applyStyle(element: HTMLElement, value: CSSStyleDeclaration | string): void;
    function callbacks<S, A>(): Callback<S, A>;
    function fireCallback<S, A>(callback: Callback<S, A>, sender: S, args: A): Callback<S, A>;
    function changeAjax(func: ((url: string, data) => JQueryPromise<any>)): void;
}
