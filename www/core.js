/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Closed-Source Licence, which can be found at LICENCE.md.
*/
 
var core = {
    getURLParameter: function(parameter) {
        return decodeURIComponent((new RegExp("[?|&]" + parameter + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
    },

    generateKey: function(length = 16, digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_") {
        var key = "";

        for (var i = 0; i < length; i++) {
            key += digits.charAt(Math.floor(Math.random() * digits.length));
        }

        return key;
    }
};

if (window.location.href.startsWith("https://") || window.location.href.startsWith("http://")) { // Features for PWA version
    navigator.notification = {
        alert: function(message, callback = function() {}, title = null) {
            alert(title != null ? title + "\n" + message : message);

            callback();
        },
        confirm: function(message, callback = function() {}, title = null) {
            var wasOK = confirm(title != null ? title + "\n" + message : message);

            callback(wasOK ? 1 : 0);
        },
        prompt: function(message, callback = function() {}, title = null) {
            var result = prompt(title != null ? title + "\n" + message : message);

            callback({
                buttonIndex: result == null ? 0 : 1,
                input1: result
            });
        }
    };
}