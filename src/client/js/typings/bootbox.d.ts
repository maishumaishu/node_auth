declare module "bootbox" {
    export = Bootbox;
}

declare namespace Bootbox {
    function alert(message: string);
    function dialog(message: string);
    function confirm(message: string);
}