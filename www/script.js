/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Closed-Source Licence, which can be found at LICENCE.md.
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

var firstTimeStatus = {
    afterSignIn: false
};

var currentUser = {
    uid: null
};

function firstTime_validateAccount() {
    if ($("#firstTime_username").val().match(/^[a-zA-Z0-9]{1,20}$/) && $("#firstTime_password").val().length >= 6) {
        $("#firstTime_validateAccount").prop("disabled", true);

        firebase.database().ref("usernames/" + $("#firstTime_username").val().toLowerCase()).once("value", function(snapshot) {
            if (snapshot.val() == null) {
                screens.moveForward("firstTime_account", "firstTime_dataUsage");
            } else {
                navigator.notification.alert(
                    _("There is already an account with that username. Try another one!"),
                    function() {},
                    _("Username taken")
                );
            }
            
            $("#firstTime_validateAccount").prop("disabled", false);
        });
    } else if ($("#firstTime_username").val() == "") {
        navigator.notification.alert(
            _("Please enter your username before signing up."),
            function() {},
            _("Incomplete information")
        );
    } else if ($("#firstTime_password").val() == "") {
        navigator.notification.alert(
            _("Please enter your password before signing up."),
            function() {},
            _("Incomplete information")
        );
    } else if ($("#firstTime_password").val().length < 6) {
        navigator.notification.alert(
            _("Your password must be at least 6 characters long."),
            function() {},
            _("Password is too short")
        );
    } else {
        navigator.notification.alert(
            _("Your username must only contain letters and numbers, and cannot exceed 20 characters."),
            function() {},
            _("Invalid username")
        );
    }
}

function firstTime_accept() {
    $("#firstTime_accept").prop("disabled", true);

    firebase.auth().createUserWithEmailAndPassword($("#firstTime_username").val().toLowerCase() + "@users.proxi.emux.app", $("#firstTime_password").val()).catch(function() {
        navigator.notification.alert(
            _("We coudln't finish setting up your account. Please check your internet connection and try again."),
            function() {
                screens.moveBack("firstTime_dataUsage", "firstTime_account");
            },
            _("We have a slight problem...")
        );

        $("#firstTime_validateAccount").prop("disabled", false);
    });
}

function firstTime_signIn() {
    if ($("#firstTime_signInUsername").val() != "" && $("#firstTime_signInPassword").val() != "") {
        $("#firstTime_signInButton").prop("disabled", true);
        localStorage.setItem("accountSetupComplete", "true");

        firstTimeStatus.afterSignIn = true;

        firebase.auth().signInWithEmailAndPassword($("#firstTime_signInUsername").val().toLowerCase() + "@users.proxi.emux.app", $("#firstTime_signInPassword").val()).catch(function(error) {
            $("#firstTime_signInButton").prop("disabled", false);
            localStorage.removeItem("accountSetupComplete");

            firstTimeStatus.afterSignIn = false;

            if (error.code == "auth/user-disabled") {
                navigator.notification.alert(
                    _("Emux Technologies have decided to lock your Proxi account manually. Please contact support to learn why and to get it unlocked again."),
                    function() {},
                    _("Your account has been locked")
                );
            } else if (error.code == "auth/user-not-found") {
                navigator.notification.alert(
                    _("There are no accounts with that username. Please check the username you've entered and try again."),
                    function() {},
                    _("Username not found")
                );
            } else if (error.code == "auth/wrong-password") {
                navigator.notification.alert(
                    _("The password you entered is wrong and does not match this account's password. Try typing it in again."),
                    function() {},
                    _("Wrong password")
                );
            } else {
                navigator.notification.alert(
                    _("It looks like we can't sign into this account. Please check your internet connection and try again."),
                    function() {},
                    _("We have a bit of a problem...")
                );
            }
        });
    } else {
        navigator.notification.alert(
            _("You'll need to enter both your username and password to sign into your account."),
            function() {
                screens.moveBack("firstTime_dataUsage", "firstTime_account");
            },
            _("Incomplete information")
        );
    }
}

function firstTime_acceptConnect() {
    $("#firstTime_validateAccount").prop("disabled", true);

    navigator.geolocation.getCurrentPosition(function() {
        if (firstTimeStatus.afterSignIn) {
            screens.moveForward("firstTime_signIn", "firstTime_homeAddress");
            $("#firstTime_signInButton").prop("disabled", false);

            firstTimeStatus.afterSignIn = false;
        } else {
            screens.moveForward("firstTime_dataUsage", "firstTime_homeAddress");
        }

        localStorage.setItem("dataAcceptConnect", "true");

        $("#firstTime_validateAccount").prop("disabled", false);
    }, function(error) {
        if (error.PERMISSION_DENIED) {
            // TODO: Show a screen that tells the user to change permission settings manually

            if (core.getURLParameter("test") == "true") { // Skip if debugging
                if (firstTimeStatus.afterSignIn) {
                    screens.moveForward("firstTime_signIn", "firstTime_homeAddress");
                    $("#firstTime_signInButton").prop("disabled", false);

                    firstTimeStatus.afterSignIn = false;
                } else {
                    screens.moveForward("firstTime_dataUsage", "firstTime_homeAddress");
                }

                localStorage.setItem("dataAcceptConnect", "true");
            }
        } else {
            // Other errors that are not permission-based are ignored at this time

            if (firstTimeStatus.afterSignIn) {
                screens.moveForward("firstTime_signIn", "firstTime_homeAddress");
                $("#firstTime_signInButton").prop("disabled", false);

                firstTimeStatus.afterSignIn = false;
            } else {
                screens.moveForward("firstTime_dataUsage", "firstTime_homeAddress");
            }

            localStorage.setItem("dataAcceptConnect", "true");
        }

        $("#firstTime_validateAccount").prop("disabled", false);
    }, {timeout: 5000});
}

function firstTime_homeAddressListProximity(latitude = 0, longitude = 0) {
    $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent($("#firstTime_homeAddressInput").val()) + ".json", {
        access_token: mapboxgl.accessToken,
        proximity: longitude + "," + latitude
    }, function(data) {
        $("#firstTime_homeAddressList").html("");

        if (data.features.length > 0) {
            for (var i = 0; i < data.features.length; i++) {
                (function(feature) {
                    $("#firstTime_homeAddressList").append(
                        $("<button>").append(
                            $("<span>").text(feature.place_name)
                        ).on("click", function() {
                            localStorage.setItem("homeAddressLatitude", String(feature.center[1]));
                            localStorage.setItem("homeAddressLongitude", String(feature.center[0]));
                            localStorage.setItem("homeAddressSet", "true");

                            resetHomeMarker();

                            screens.moveBack("firstTime_homeAddress", "home");

                            tracking.start();
                        })
                    );
                })(data.features[i]);
            }
        } else {
            $("#firstTime_homeAddressList").append([
                $("<h2>").text(_("No results found")),
                $("<p>").text(_("Check the address that you typed in."))
            ]);
        }
    });
}

function firstTime_homeAddressList() {
    navigator.geolocation.getCurrentPosition(function(position) {
        firstTime_homeAddressListProximity(position.coords.latitude, position.coords.longitude);
    }, function() {
        firstTime_homeAddressListProximity();
    }, {timeout: 3000});
}

function firstTime_homeAddressSetCurrent() {
    navigator.geolocation.getCurrentPosition(function(position) {
        localStorage.setItem("homeAddressLatitude", String(position.coords.latitude));
        localStorage.setItem("homeAddressLongitude", String(position.coords.longitude));
        localStorage.setItem("homeAddressSet", "true");

        resetHomeMarker();

        screens.moveBack("firstTime_homeAddress", "home");

        tracking.start();
    }, function() {
        navigator.notification.alert(
            _("Please enter your address instead."),
            function() {},
            _("We couldn't get your current location")
        );
    }, {timeout: 3000, enableHighAccuracy: true});
}

function settings_reportInfectionFinal() {
    navigator.notification.confirm(
        _("Final chance! If you do think you have the symptoms of COVID-19 or you have been tested positive, please continue. If not, please do not report your case."),
        function(index) {
            if (index == 1) {
                tracking.knownToInfect();

                navigator.notification.alert(
                    _("Thank you for reporting your case. We rely on people to give accurate reports, so we thank you for taking part in helping us fight COVID-19."),
                    function() {},
                    _("Report sent")
                );
            }
        },
        _("Report COVID-19 infection?"),
        [_("Report"), _("Cancel")]
    );
}

function signOut() {
    navigator.notification.confirm(
        _("If you sign out, your home address will no longer be kept."),
        function(index) {
            if (index == 1) {
                tracking.stop();

                screens.switch("firstTime_intro");

                setTimeout(function() {
                    localStorage.removeItem("accountSetupComplete");
                    localStorage.removeItem("dataAcceptConnect");
                    localStorage.removeItem("homeAddressSet");
                    localStorage.removeItem("homeAddressLatitude");
                    localStorage.removeItem("homeAddressLongitude");
                    localStorage.removeItem("knownAboutInfection");
    
                    firebase.auth().signOut();
                }, 3000);
            }
        },
        _("Sign out?"),
        [_("Sign out"), _("Cancel")]
    );
}

firebase.initializeApp(firebaseConfig);
firebase.analytics();

document.addEventListener("deviceready", function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser.uid = user.uid;

            if (localStorage.getItem("accountSetupComplete") != "true") {
                if ($("#firstTime_username").val() != "") {
                    firebase.database().ref("users/" + currentUser.uid).set({
                        username: $("#firstTime_username").val()
                    }).then(function() {
                        firebase.database().ref("usernames/" + $("#firstTime_username").val()).set(currentUser.uid).then(function() {
                            localStorage.setItem("accountSetupComplete", "true");

                            firstTime_acceptConnect();
                        });
                    });
                } else {
                    screens.switch("firstTime_intro");

                    navigator.notification.alert(
                        _("We coudln't finish setting up your account. Please contact our support service or try making a new account."),
                        function() {},
                        _("We have a major problem...")
                    );
                }
            } else if (localStorage.getItem("dataAcceptConnect") != "true") {
                firstTime_acceptConnect();
            } else if (localStorage.getItem("homeAddressSet") != "true") {
                screens.switch("firstTime_homeAddress");
            } else {
                screens.switch("home");

                tracking.start();
            }
        } else {
            currentUser.uid = null;

            screens.switch("firstTime_intro");

            tracking.stop();
        }

        setTimeout(function() {
            $("#loader").fadeOut(500);
        }, 1000);
    });
}, false);