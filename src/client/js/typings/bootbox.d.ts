declare module "bootbox" {
    export = Bootbox;
}

declare namespace Bootbox {
    function alert(options: any);
    //function alert(options: any);
    function dialog(message: string);
    function confirm(options: any);
}