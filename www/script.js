/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Open-Source Licence, which can be found at LICENCE.md.
*/

const firebaseConfig = {
    apiKey: "AIzaSyCr9Z8ZC6wfJfO7UfKA6yekQVV3-ETHvxI",
    authDomain: "emux-proxi.firebaseapp.com",
    databaseURL: "https://emux-proxi.firebaseio.com",
    projectId: "emux-proxi",
    storageBucket: "emux-proxi.appspot.com",
    messagingSenderId: "343865620736",
    appId: "1:343865620736:web:acd5997d95ec9da0409be5",
    measurementId: "G-WNRC70DND8"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

document.addEventListener("deviceready", function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            screens.switch("home");
        } else {
            screens.switch("firstTime_intro");
        }

        setTimeout(function() {
            $("#loader").fadeOut(500);
        }, 1000);
    });
}, false);