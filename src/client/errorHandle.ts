import * as service from 'services/service';
import * as bootbox from 'bootbox';

service.error.add((sender, err: Error) => {
    //alert(err.message);
    //confirm(err.message);
    // bootbox.alert({
    //     title: "错误信息",
    //     message: err.message,
    //     // buttons: {
    //     //     cancel: {
    //     //         label: '<i class="fa fa-times"></i> 确定'
    //     //     }
    //     // },
    //     callback: function (result) {
    //         console.log('This was logged in the callback: ' + result);
    //     }
    // });
    ui.alert(err.message);
})