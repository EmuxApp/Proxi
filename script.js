/*
    Proxi

    Copyright (C) Emux Technologies. All Rights Reserved.
    https://emux.app
    
    Licenced by the Emux Closed-Source Licence, which can be found at LICENCE.md.
*/

var installPrompt = null;

function installApp() {
    if (installPrompt != null) {
        installPrompt.prompt();

        installPrompt = null;
    } else {
        screens.moveForward("storefront", "installation");
    }
}

window.addEventListener("beforeinstallprompt", function(event) {
    event.preventDefault();

    installPrompt = event;
});

$(function() {
    if (navigator.userAgent.toLowerCase().indexOf("android") > -1) { // Android
        $(".android").show();
        $(".ios").hide();
    } else {
        $(".android").hide();
        $(".ios").show();
    }
});