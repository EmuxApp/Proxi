/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Closed-Source Licence, which can be found at LICENCE.md.
*/

var alerts = {
    modes: [
        {type: "vibrate", name: _("Vibrate")},
        {type: "random", name: _("Random"), of: "sound"},
        {type: "sound", name: _("Radar"), src: "media/sounds/radar.wav"},
        {type: "sound", name: _("Boing"), src: "media/sounds/boing.wav"},
        {type: "sound", name: _("Oi!"), src: "media/sounds/oi.wav"},
        {type: "sound", name: _("Drum"), src: "media/sounds/drum.wav"},
        {type: "sound", name: _("Robot"), src: "media/sounds/robot.wav"},
        {type: "sound", name: _("Bell"), src: "media/sounds/bell.wav"},
        {type: "sound", name: _("Anhinga bird"), src: "media/sounds/anhingaBird.mp3"},
        {type: "sound", name: _("Appear"), src: "media/sounds/appear.mp3"},
        {type: "sound", name: _("Applause"), src: "media/sounds/applause.mp3"},
        {type: "sound", name: _("Baby sneeze"), src: "media/sounds/babySneeze.mp3"},
        {type: "sound", name: _("Bald eagle"), src: "media/sounds/baldEagle.mp3"},
        {type: "sound", name: _("Fart"), src: "media/sounds/fart.mp3"},
        {type: "sound", name: _("Bear cubs"), src: "media/sounds/bearCubs.mp3"},
        {type: "sound", name: _("Cannon fire"), src: "media/sounds/cannonFire.mp3"},
        {type: "sound", name: _("Chicken"), src: "media/sounds/chicken.mp3"},
        {type: "sound", name: _("Coyote call"), src: "media/sounds/coyoteCall.mp3"},
        {type: "sound", name: _("Promotion"), src: "media/sounds/promotion.mp3"},
        {type: "sound", name: _("Dog licking"), src: "media/sounds/dogLicking.mp3"},
        {type: "sound", name: _("Rainforest frogs"), src: "media/sounds/rainforestFrogs.mp3"},
        {type: "sound", name: _("Gorilla"), src: "media/sounds/gorilla.mp3"},
        {type: "sound", name: _("Wolves"), src: "media/sounds/wolves.mp3"},
        {type: "sound", name: _("Morse code"), src: "media/sounds/morseCode.mp3"},
        {type: "sound", name: _("Musket fire"), src: "media/sounds/musketFire.mp3"},
        {type: "sound", name: _("Parrots"), src: "media/sounds/parrots.mp3"},
        {type: "sound", name: _("Raven"), src: "media/sounds/raven.mp3"},
        {type: "sound", name: _("Church bells"), src: "media/sounds/churchBells.mp3"},
        {type: "sound", name: _("Toilet flush"), src: "media/sounds/toiletFlush.mp3"},
        {type: "sound", name: _("Turkey"), src: "media/sounds/turkey.mp3"},
        {type: "sound", name: _("UFO"), src: "media/sounds/ufo.mp3"},
        {type: "flash", name: _("Visible flash")}
    ],
    currentMode: 0,
    currentAudio: null
};

alerts.fire = function() {
    if (alerts.currentAudio != null) {
        alerts.currentAudio.pause();
        
        alerts.currentAudio = null;
    }

    if (alerts.modes[alerts.currentMode].type == "vibrate") {
        if ("vibrate" in navigator) {
            navigator.vibrate(1000);
        }
    } else if (alerts.modes[alerts.currentMode].type == "sound") {
        alerts.currentAudio = new Audio(alerts.modes[alerts.currentMode].src);
        
        alerts.currentAudio.play();
    } else if (alerts.modes[alerts.currentMode].type == "random") {
        var filteredModes = [];

        for (var i = 0; i < alerts.modes.length; i++) {
            if (alerts.modes[i].type == alerts.modes[alerts.currentMode].of) {
                filteredModes.push(alerts.modes[i]);
            }
        }

        alerts.currentAudio = new Audio(filteredModes[Math.floor(Math.random() * filteredModes.length)].src);
        
        alerts.currentAudio.play();
    } else if (alerts.modes[alerts.currentMode].type == "flash") {
        var repetition = 0;
        var repetitionInterval = setInterval(function() {
            if (repetition % 2 == 0) {
                $("body").addClass("alertFlash");
            } else {
                $("body").removeClass("alertFlash");
            }

            if (repetition == 3) {
                clearInterval(repetitionInterval);
            }

            repetition++;
        }, 500);
    }

    console.log("Alert " + alerts.currentMode + " played");
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
    if (!("vibrate" in navigator) || /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        if (localStorage.getItem("alertsMode") == 0 || localStorage.getItem("alertsMode") == null) {
            localStorage.setItem("alertsMode", 2);

            $(".vibrateAlertMode").remove();
        }
    }

    alerts.set(Number(localStorage.getItem("alertsMode") || 0));
});