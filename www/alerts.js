/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Closed-Source Licence, which can be found at LICENCE.md.
*/

var alerts = {
    modes: [
        {type: "vibrate", name: _("Vibrate")},
        {type: "sound", name: _("Radar"), src: "media/sounds/radar.wav"},
        {type: "sound", name: _("Boing"), src: "media/sounds/boing.wav"},
        {type: "sound", name: _("Oi!"), src: "media/sounds/oi.wav"},
        {type: "sound", name: _("Drum"), src: "media/sounds/drum.wav"},
        {type: "sound", name: _("Robot"), src: "media/sounds/robot.wav"},
        {type: "sound", name: _("Bell"), src: "media/sounds/bell.wav"}
    ],
    currentMode: 0
};

alerts.fire = function() {
    if (alerts.modes[alerts.currentMode].type == "vibrate") {
        navigator.vibrate(1000);
    } else if (alerts.modes[alerts.currentMode].type == "sound") {
        new Audio(alerts.modes[alerts.currentMode].src).play();
    }
};

alerts.set = function(mode = 0, fireAfterSetting = false) {
    alerts.currentMode = mode;

    $(".alertsMode").text(alerts.modes[alerts.currentMode].name);
    $(".alertsCheckmark:not([data-alert='" + alerts.currentMode + "'])").hide();
    $(".alertsCheckmark[data-alert='" + alerts.currentMode + "']").show();

    localStorage.setItem("alertsMode", String(alerts.currentMode));

    if (fireAfterSetting) {
        alerts.fire();
    }
};

$(function() {
    alerts.set(Number(localStorage.getItem("alertsMode") || 0));
});