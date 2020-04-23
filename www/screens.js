/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Open-Source Licence, which can be found at LICENCE.md.
*/

var screens = {
    switch: function(to = "home") {
        $("main[id='" + to + "']").css({
            "left": "0"
        });

        $("main:not([id='" + to + "'])").attr("hidden", "");
        $("main[id='" + to + "']").removeAttr("hidden");

        if ($("footer a[data-screen='" + to + "']").length > 0) {
            $("footer a:not([data-screen='" + to + "'])").removeClass("selected");
            $("footer a[data-screen='" + to + "']").addClass("selected");
        }

        screens.load(to);
    },

    moveBack: function(from, to = "home") {
        $("main[id='" + from + "']").css({
            "z-index": "2",
            "left": "0"
        });

        $("main[id='" + to + "']").css({
            "z-index": "1",
            "left": "0",
            "filter": "brightness(0.5)"
        });

        $("main[id='" + from + "']").removeAttr("hidden");
        $("main[id='" + to + "']").removeAttr("hidden");

        $("main[id='" + from + "']").animate({
            "left": $(window).width() + "px"
        }, {
            duration: 350
        });

        var currentBrightness = 0.5;
        
        $({brightness: currentBrightness}).animate({
            brightness: currentBrightness + 0.5
        }, {
            duration: 350,
            step: function() {
                $("main[id='" + to + "']").css({
                    "filter": "brightness(" + this.brightness + ")"
                });

                currentBrightness = this.brightness;
            }
        });

        if ($("footer a[data-screen='" + to + "']").length > 0) {
            $("footer a:not([data-screen='" + to + "'])").removeClass("selected");
            $("footer a[data-screen='" + to + "']").addClass("selected");
        }

        setTimeout(function() {
            $("main[id='" + from + "']").attr("hidden", "");
            $("main[id='" + from + "']").css({
                "left": "0"
            });
        }, 350);

        screens.load(to);
    },

    moveForward: function(from, to = "home") {
        $("main[id='" + from + "']").css({
            "z-index": "1",
            "left": "0",
            "filter": "brightness(0.5)"
        });

        $("main[id='" + to + "']").css({
            "z-index": "2",
            "left": $(window).width() + "px"
        });

        $("main[id='" + from + "']").removeAttr("hidden");
        $("main[id='" + to + "']").removeAttr("hidden");

        $("main[id='" + to + "']").animate({
            "left": "0"
        }, {
            duration: 350
        });

        var currentBrightness = 1;
        
        $({brightness: currentBrightness}).animate({
            brightness: currentBrightness - 0.5
        }, {
            duration: 350,
            step: function() {
                $("main[id='" + from + "']").css({
                    "filter": "brightness(" + this.brightness + ")"
                });

                currentBrightness = this.brightness;
            }
        });

        if ($("footer a[data-screen='" + to + "']").length > 0) {
            $("footer a:not([data-screen='" + to + "'])").removeClass("selected");
            $("footer a[data-screen='" + to + "']").addClass("selected");
        }

        setTimeout(function() {
            $("main[id='" + from + "']").attr("hidden", "");
            $("main[id='" + from + "']").css({
                "left": "0"
            });
        }, 350);

        screens.load(to);
    },

    load: function(screen = "home") {
        if (screen == "map") {
            map.resize();
        }
    }
};

$(function() {
    screens.switch("home");
});