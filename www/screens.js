/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Open-Source Licence, which can be found at LICENCE.md.
*/

var screens = {
    switch: function(screen = "home") {
        $("main:not([id='" + screen + "'])").attr("hidden", "");
        $("main[id='" + screen + "']").attr("hidden", null);

        $("footer a:not([data-screen='" + screen + "'])").removeClass("selected");
        $("footer a[data-screen='" + screen + "']").addClass("selected");
    }
};

$(function() {
    screens.switch("home");
});