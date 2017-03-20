$(function(){
    const {ipcRenderer} = require("electron");
    
    // titlebar elements
    $("#titleBar").find("i").click(function(){
        $action = $(this).attr("data-action");
        ipcRenderer.sendSync("titleBar", $action);
        
    });
});