/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Proxi Terms of Service, which can be found at https://emux.app/terms.
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
    afterSignIn: false,
    justSignedOut: false
};

var currentUser = {
    uid: null,
    username: null,
    fullName: null
};

var currentUserSettingsReference = null;
var currentFamilyReference = null;
var currentFamily = [];
var currentFamilyAids = [];

var console = {};

console.log = function() {
    $("#settings_aboutDevelopersLog").text($("#settings_aboutDevelopersLog").text() + "LOG: " + Array.prototype.slice.call(arguments).join(" ") + "\n");
};

console.warn = function() {
    $("#settings_aboutDevelopersLog").text($("#settings_aboutDevelopersLog").text() + "WARN: " + Array.prototype.slice.call(arguments).join(" ") + "\n");
};

console.error = function() {
    $("#settings_aboutDevelopersLog").text($("#settings_aboutDevelopersLog").text() + "ERROR: " + Array.prototype.slice.call(arguments).join(" ") + "\n");
};

window.console = console;

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

function firstTime_acceptConnect(fromDenied = false) {
    $(fromDenied ? "#firstTime_connectErrorButton" : "#firstTime_validateAccount").prop("disabled", true);

    navigator.geolocation.getCurrentPosition(function() {
        if (firstTimeStatus.afterSignIn) {
            screens.moveForward(fromDenied ? "firstTime_connectError" : "firstTime_signIn", "firstTime_homeAddress");
            $(fromDenied ? "#firstTime_connectErrorButton" : "#firstTime_signInButton").prop("disabled", false);

            firstTimeStatus.afterSignIn = false;
        } else {
            screens.moveForward(fromDenied ? "firstTime_connectError" : "firstTime_dataUsage", "firstTime_homeAddress");
        }

        localStorage.setItem("dataAcceptConnect", "true");

        $(fromDenied ? "#firstTime_connectErrorButton" : "#firstTime_validateAccount").prop("disabled", false);
    }, function(error) {
        if (error.PERMISSION_DENIED) {
            if (core.getURLParameter("test") == "true") { // Skip if debugging
                if (firstTimeStatus.afterSignIn) {
                    screens.moveForward(fromDenied ? "firstTime_connectError" : "firstTime_signIn", "firstTime_homeAddress");
                    $(fromDenied ? "#firstTime_connectErrorButton" : "#firstTime_validateAccount").prop("disabled", false);

                    firstTimeStatus.afterSignIn = false;
                } else {
                    screens.moveForward(fromDenied ? "firstTime_connectError" : "firstTime_dataUsage", "firstTime_homeAddress");
                }

                localStorage.setItem("dataAcceptConnect", "true");
            } else {
                $(fromDenied ? "#firstTime_connectErrorButton" : "#firstTime_validateAccount").prop("disabled", false);

                if (!fromDenied) {
                    screens.moveForward("firstTime_signIn", "firstTime_connectError");
                }
            }
        } else {
            // Other errors that are not permission-based are ignored at this time

            if (firstTimeStatus.afterSignIn) {
                screens.moveForward(fromDenied ? "firstTime_connectError" : "firstTime_signIn", "firstTime_homeAddress");
                $(fromDenied ? "#firstTime_connectErrorButton" : "#firstTime_signInButton").prop("disabled", false);

                firstTimeStatus.afterSignIn = false;
            } else {
                screens.moveForward(fromDenied ? "firstTime_connectError" : "firstTime_dataUsage", "firstTime_homeAddress");
            }

            localStorage.setItem("dataAcceptConnect", "true");
        }

        $(fromDenied ? "#firstTime_connectErrorButton" : "#firstTime_validateAccount").prop("disabled", false);
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

                            firebase.database().ref("users/" + currentUser.uid + "/awards/statistics/lastOutside").set(firebase.database.ServerValue.TIMESTAMP);

                            tracking.start();
                            awards.start();
                            settings_currentUserSettings();
                            family_currentMembersList();
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

        firebase.database().ref("users/" + currentUser.uid + "/awards/statistics/lastOutside").set(firebase.database.ServerValue.TIMESTAMP);

        tracking.start();
        awards.start();
        settings_currentUserSettings();
        family_currentMembersList();
    }, function() {
        navigator.notification.alert(
            _("Please enter your address instead."),
            function() {},
            _("We couldn't get your current location")
        );
    }, {timeout: 3000, enableHighAccuracy: true});
}

function settings_currentUserSettings() {
    if (currentUserSettingsReference != null) {
        currentUserSettingsReference.off();
    }

    currentUserSettingsReference = firebase.database().ref("users/" + currentUser.uid);

    currentUserSettingsReference.on("value", function(snapshot) {
        $(".username").text(snapshot.val().username);
        $(".fullName").text(snapshot.val().fullName || "");

        currentUser.username = snapshot.val().username;
        currentUser.fullName = snapshot.val().fullName;

        $(".fullNameOrUsername").text(snapshot.val().fullName ? snapshot.val().fullName : snapshot.val().username);
        $(".usernameOrNone").text(snapshot.val().fullName ? snapshot.val().username : "");

        if (snapshot.val().profileImageType == "png") {
            firebase.storage().ref("users/" + currentUser.uid + "/profile.png").getDownloadURL().then(function(url) {
                $(".myProfile").attr("src", url);
            });
        } else if (snapshot.val().profileImageType == "jpg") {
            firebase.storage().ref("users/" + currentUser.uid + "/profile.jpg").getDownloadURL().then(function(url) {
                $(".myProfile").attr("src", url);
            });
        } else {
            $(".myProfile").attr("src", "media/profile.svg");
        }
    });
}

function settings_editInfoUnlock() {
    $("#settings_editInfoSensitiveButton").prop("disabled", true);

    firebase.auth().currentUser.reauthenticateWithCredential(
        firebase.auth.EmailAuthProvider.credential(
            firebase.auth().currentUser.email,
            $("#settings_editInfoSensitivePassword").val()
        )
    ).then(function() {
        screens.moveForward("settings_editInfoSensitive", "settings_editInfo");

        $("#settings_editInfoSensitiveButton").prop("disabled", false);

        setTimeout(function() {
            $("#settings_editInfoSensitivePassword").val("");
        }, 500);
    }).catch(function(error) {
        if (error.code == "auth/user-disabled") {
            navigator.notification.alert(
                _("Emux Technologies have decided to lock your Proxi account manually. Please contact support to learn why and to get it unlocked again."),
                function() {},
                _("Your account has been locked")
            );
        } else if (error.code == "auth/user-not-found") {
            navigator.notification.alert(
                _("The user that you are currently signed into may have been deleted."),
                function() {},
                _("User not found")
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

        $("#settings_editInfoSensitivePassword").val("");
        $("#settings_editInfoSensitiveButton").prop("disabled", false);
    });
}

function settings_changeUsername() {
    navigator.notification.prompt(
        _("Keep in mind: your username can only contain letters and numbers, and cannot exceed 20 characters."),
        function(result) {
            if (result.buttonIndex == 1) {
                if (result.input1.match(/^[a-zA-Z0-9]{1,20}$/) && result.input1 != "") {
                    firebase.database().ref("usernames/" + result.input1.toLowerCase()).once("value", function(snapshot) {
                        if (snapshot.val() == null) {
                            firebase.auth().currentUser.updateEmail(result.input1.toLowerCase() + "@users.proxi.emux.app").then(function() {
                                firebase.database().ref("usernames/" + currentUser.username.toLowerCase()).set(null).then(function() {
                                    firebase.database().ref("usernames/" + result.input1.toLowerCase()).set(currentUser.uid).then(function() {
                                        firebase.database().ref("users/" + currentUser.uid + "/username").set(result.input1);
                                    });
                                }).catch(function() {
                                    navigator.notification.alert(
                                        _("Check your connection to the internet and try again."),
                                        function() {},
                                        _("Couldn't change username")
                                    );
                                });
                            }).catch(function() {
                                navigator.notification.alert(
                                    _("Check your connection to the internet and try again."),
                                    function() {},
                                    _("Couldn't change username")
                                );
                            });
                        } else {
                            navigator.notification.alert(
                                _("There is already an account with that username. Try another one!"),
                                function() {},
                                _("Username taken")
                            );
                        }
                    }).catch(function() {
                        navigator.notification.alert(
                            _("Check your connection to the internet and try again."),
                            function() {},
                            _("Couldn't change username")
                        );
                    });
                } else if (result.input1 == "") {
                    navigator.notification.alert(
                        _("Your username cannot be blank."),
                        function() {},
                        _("Username not specified")
                    );
                } else {
                    navigator.notification.alert(
                        _("Your username must only contain letters and numbers, and cannot exceed 20 characters."),
                        function() {},
                        _("Invalid username")
                    );
                }
            }
        },
        _("Change username"),
        [_("Save"), _("Cancel")],
        currentUser.username
    )
}

function settings_changeFullName() {
    navigator.notification.prompt(
        _("Your full name can be used by selected third parties to identify you."),
        function(result) {
            if (result.buttonIndex == 1) {
                if (result.input1.trim() != "") {
                    firebase.database().ref("users/" + currentUser.uid + "/fullName").set(result.input1.trim().substring(0, 50)).catch(function() {
                        navigator.notification.alert(
                            _("Check your connection to the internet and try again."),
                            function() {},
                            _("Couldn't change full name")
                        );
                    });
                }
            }
        },
        _("Change full name"),
        [_("Save"), _("Cancel")],
        currentUser.fullName || ""
    )
}

function settings_changeProfilePicture() {
    if (window.location.href.startsWith("https://") || window.location.href.startsWith("http://")) { // Features for PWA version
        $("#settings_changeProfilePicture_fileUpload").click();
    } else {
        navigator.camera.getPicture(function(dataUrl) {
            firebase.storage().ref("users/" + currentUser.uid + "/profile.png").putString("data:image/png;base64," + dataUrl, "data_url").then(function() {
                $(".myProfile").attr("src", "data:image/png;base64," + dataUrl);
                
                firebase.database().ref("users/" + currentUser.uid + "/profileImageType").set("png");
            }).catch(function() {
                setTimeout(function() {
                    navigator.notification.alert(
                        _("Check your connection to the internet or try choosing a smaller picture."),
                        function() {},
                        _("Couldn't change profile picture")
                    );
                });
            });
        }, function() {}, {
            quality: 100,
            targetWidth: 100,
            targetHeight: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.PNG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: true,
            correctOrientation: true
        });
    }
}

function settings_changePassword() {
    if ($("#settings_changePasswordFirst").val() == $("#settings_changePasswordSecond").val() && $("#settings_changePasswordFirst").val().length >= 6) {
        $("#settings_changePasswordButton").prop("disabled", true);

        firebase.auth().currentUser.updatePassword($("#settings_changePasswordFirst").val()).then(function() {
            screens.moveBack("settings_changePassword", "settings_editInfo");

            $("#settings_changePasswordButton").prop("disabled", false);

            setTimeout(function() {
                $("#settings_changePasswordFirst").val("");
                $("#settings_changePasswordSecond").val("");
            }, 500);
        }).catch(function() {
            navigator.notification.alert(
                _("Check your connection to the internet and try again."),
                function() {},
                _("Couldn't change password")
            );
        });
    } else if ($("#settings_changePasswordFirst").val() != $("#settings_changePasswordSecond").val()) {
        navigator.notification.alert(
            _("Make sure that you've typed the same password in both fields."),
            function() {},
            _("Passwords don't match")
        );
    } else if ($("#settings_changePasswordFirst").val() == "" || $("#settings_changePasswordSecond").val()) {
        navigator.notification.alert(
            _("Please enter your new password into both fields."),
            function() {},
            _("Incomplete information")
        );
    } else {
        navigator.notification.alert(
            _("Your password must be at least 6 characters long."),
            function() {},
            _("Password is too short")
        );
    }
}

function settings_deleteAccountRest() {
    firebase.database().ref("usernames/" + currentUser.username.toLowerCase()).set(null).then(function() {
        firebase.database().ref("users/" + currentUser.uid).set(null).then(function() {
            firebase.auth().currentUser.delete().then(function() {
                navigator.notification.alert(
                    _("Your account has been successfully deleted. Thank you for using Proxi!"),
                    function() {},
                    _("Account deleted")
                );

                localStorage.removeItem("accountSetupComplete");
                localStorage.removeItem("dataAcceptConnect");
                localStorage.removeItem("homeAddressSet");
                localStorage.removeItem("homeAddressLatitude");
                localStorage.removeItem("homeAddressLongitude");
                localStorage.removeItem("knownAboutInfection");
                
                screens.switch("firstTime_intro");

                $("#settings_deleteAccountButton").prop("disabled", true);
            }).catch(function() {
                navigator.notification.alert(
                    _("Check your connection to the internet and try again. If the problem persists, please contact our support team."),
                    function() {},
                    _("Couldn't delete account")
                );

                $("#settings_deleteAccountButton").prop("disabled", false);

                tracking.start();
                awards.start();
            });
        }).catch(function() {
            navigator.notification.alert(
                _("Check your connection to the internet and try again. If the problem persists, please contact our support team."),
                function() {},
                _("Couldn't delete account")
            );

            $("#settings_deleteAccountButton").prop("disabled", false);

            tracking.start();
            awards.start();
        });
    }).catch(function() {
        navigator.notification.alert(
            _("Check your connection to the internet and try again. If the problem persists, please contact our support team."),
            function() {},
            _("Couldn't delete account")
        );

        $("#settings_deleteAccountButton").prop("disabled", false);

        tracking.start();
        awards.start();
    });
}

function settings_deleteAccountFinal() {
    navigator.notification.confirm(
        _("Final chance! We can't recover your account if you accidentally delete it."),
        function(index) {
            if (index == 1) {
                $("#settings_deleteAccountButton").prop("disabled", true);

                tracking.stop();

                firebase.database().ref("users/" + currentUser.uid + "/profileImageType").once("value", function(snapshot) {
                    if (snapshot.val() == "png") {
                        firebase.storage().ref("users/" + currentUser.uid + "/profile.png").delete().then(function() {
                            settings_deleteAccountRest();
                        }).catch(function() {
                            navigator.notification.alert(
                                _("Check your connection to the internet and try again. If the problem persists, please contact our support team."),
                                function() {},
                                _("Couldn't delete account")
                            );

                            $("#settings_deleteAccountButton").prop("disabled", false);
                        });
                    } else if (snapshot.val() == "jpg") {
                        firebase.storage().ref("users/" + currentUser.uid + "/profile.jpg").delete().then(function() {
                            settings_deleteAccountRest();
                        }).catch(function() {
                            navigator.notification.alert(
                                _("Check your connection to the internet and try again. If the problem persists, please contact our support team."),
                                function() {},
                                _("Couldn't delete account")
                            );

                            $("#settings_deleteAccountButton").prop("disabled", false);
                        });
                    } else {
                        settings_deleteAccountRest();
                    }
                });
            }
        },
        _("Delete account?"),
        [_("Delete"), _("Cancel")]
    );
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

function settings_retrievePersonalData() {
    $("#settings_dataRetrievalResult").text("");

    screens.moveForward("settings_yourData", "settings_dataRetrieval");

    firebase.database().ref("users/" + currentUser.uid).once("value", function(snapshot) {
        $("#settings_dataRetrievalResult").text(JSON.stringify(snapshot.val()));
    });
}

function settings_homeAddressListProximity(latitude = 0, longitude = 0) {
    $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent($("#settings_homeAddressInput").val()) + ".json", {
        access_token: mapboxgl.accessToken,
        proximity: longitude + "," + latitude
    }, function(data) {
        $("#settings_homeAddressList").html("");

        if (data.features.length > 0) {
            for (var i = 0; i < data.features.length; i++) {
                (function(feature) {
                    $("#settings_homeAddressList").append(
                        $("<button>").append(
                            $("<span>").text(feature.place_name)
                        ).on("click", function() {
                            localStorage.setItem("homeAddressLatitude", String(feature.center[1]));
                            localStorage.setItem("homeAddressLongitude", String(feature.center[0]));
                            localStorage.setItem("homeAddressSet", "true");

                            resetHomeMarker();

                            screens.moveBack("settings_geolocationOptionsEnterAddress", "settings_geolocationOptions");
                        })
                    );
                })(data.features[i]);
            }
        } else {
            $("#settings_homeAddressList").append([
                $("<h2>").text(_("No results found")),
                $("<p>").text(_("Check the address that you typed in."))
            ]);
        }
    });
}

function settings_homeAddressList() {
    navigator.geolocation.getCurrentPosition(function(position) {
        settings_homeAddressListProximity(position.coords.latitude, position.coords.longitude);
    }, function() {
        settings_homeAddressListProximity();
    }, {timeout: 3000});
}

function settings_homeAddressSetCurrent() {
    navigator.geolocation.getCurrentPosition(function(position) {
        localStorage.setItem("homeAddressLatitude", String(position.coords.latitude));
        localStorage.setItem("homeAddressLongitude", String(position.coords.longitude));
        localStorage.setItem("homeAddressSet", "true");

        resetHomeMarker();

        navigator.notification.alert(
            _("Your home address has been successfully determined from your current location."),
            function() {},
            _("Home address set")
        );
    }, function() {
        navigator.notification.alert(
            _("Please enter your address instead."),
            function() {},
            _("We couldn't get your current location")
        );
    }, {timeout: 3000, enableHighAccuracy: true});
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

                    firstTimeStatus.justSignedOut = true;
    
                    firebase.auth().signOut();
                }, 3000);
            }
        },
        _("Sign out?"),
        [_("Sign out"), _("Cancel")]
    );
}

function family_currentMembersList() {
    if (currentFamilyReference != null) {
        currentFamilyReference.off();
    }

    currentFamilyReference = firebase.database().ref("users/" + currentUser.uid + "/family");
    
    currentFamilyReference.on("value", function(snapshot) {
        $("#family_currentMembersList").html("");

        if (snapshot.val() != null) {
            currentFamily = Object.keys(snapshot.val());

            for (var i = 0; i < currentFamily.length; i++) {
                (function(familyUid) {
                    firebase.database().ref("users/" + familyUid + "/username").once("value", function(childSnapshot) {
                        $("#family_currentMembersList").append(
                            $("<button>")
                                .append([
                                    $("<span>").text(childSnapshot.val()),
                                    $("<icon aria-label='@Enabled'>").text("done")
                                ])
                                .on("click", function() {
                                    navigator.notification.confirm(
                                        _("When you remove a family contact, they will now begin to receive alerts from your presence."),
                                        function(index) {
                                            if (index == 1) {
                                                firebase.database().ref("users/" + currentUser.uid + "/family/" + familyUid).set(null);

                                                setTimeout(function() {
                                                    tracking.rescanFamily(true);
                                                }, 3000);
                                                
                                            }
                                        },
                                        _("Remove family contact?"),
                                        [_("Remove"), _("Cancel")]
                                    );
                                })
                        );
                    });
                })(currentFamily[i]);
            }

            $(".familyContactsCount").text(currentFamily.length);
        } else {
            currentFamily = [];

            $("#family_currentMembersList").append([
                $("<img src='media/graphics/home.svg' alt='@Graphic of a house' class='headerGraphicSmaller'>"),
                $("<h3 class='center'>").text(_("No family contacts yet")),
                $("<p class='center'>").text(_("Add family contacts so that your family members are not alerted by your presence. If they do the same, you will not be alerted by them too."))
            ]);

            $(".familyContactsCount").text(0);
        }
    });
}

function family_newMemberList() {
    var usernameQuery = $("#family_newMemberInput").val().toLowerCase().trim();

    if (usernameQuery != "") {
        firebase.database().ref("usernames").orderByKey().startAt(usernameQuery).endAt(usernameQuery + "\uf8ff").limitToFirst(20).once("value", function(snapshot) {
            if (snapshot.val() != null) {
                $("#family_newMemberList").html("");

                for (var username in snapshot.val()) {
                    (function(uid) {
                        firebase.database().ref("users/" + uid + "/username").once("value", function(childSnapshot) { // We get the username so that we have the capitalised version
                            $("#family_newMemberList button[data-username='" + childSnapshot.val().toLowerCase() + "']").remove();
                            
                            $("#family_newMemberList").append(
                                $("<button>")
                                    .attr("data-username", childSnapshot.val().toLowerCase())
                                    .append(
                                        $("<span>").text(childSnapshot.val())
                                    )
                                    .on("click", function(event) {
                                        if (uid != currentUser.uid) {
                                            if (currentFamily.indexOf(uid) < 0) {
                                                firebase.database().ref("users/" + currentUser.uid + "/family/" + uid).set(true);
        
                                                $(event.target).append(
                                                    $("<icon aria-label='@Enabled'>").text("done")
                                                );
        
                                                currentFamily.push(uid);
                                                tracking.rescanFamily();

                                                firebase.database().ref("users/" + currentUser.uid + "/awards/achievements/5/wonTimes").once("value", function(snapshot) {
                                                    if (snapshot.val() == null || snapshot.val() == 0) {
                                                        awards.win(5);
                                                    }
                                                });
                                            } else {
                                                navigator.notification.alert(
                                                    _("This family contact has already been added to your family. You can remove them under the 'Current members' section."),
                                                    function() {},
                                                    _("Family contact already added")
                                                );
                                            }
                                        } else {
                                            navigator.notification.alert(
                                                _("You won't be alerted by your own presence, because that's just weird."),
                                                function() {},
                                                _("This is you!")
                                            );
                                        }
                                    })
                            );
                        });
                    })(snapshot.val()[username]);
                }
            } else {
                $("#family_newMemberList").html("");

                $("#family_newMemberList").append([
                    $("<h3 class='center'>").text(_("No results found")),
                    $("<p class='center'>").text(_("Double-check the username that you typed in."))
                ]);
            }
        });
    } else {
        $("#family_newMemberList").html("");
    }
}

firebase.initializeApp(firebaseConfig);
firebase.analytics();

function appReady() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser.uid = user.uid;

            if (localStorage.getItem("accountSetupComplete") != "true") {
                if ($("#firstTime_username").val() != "") {
                    firebase.database().ref("users/" + currentUser.uid).set({
                        username: $("#firstTime_username").val()
                    }).then(function() {
                        firebase.database().ref("usernames/" + $("#firstTime_username").val().toLowerCase()).set(currentUser.uid).then(function() {
                            localStorage.setItem("accountSetupComplete", "true");

                            firstTime_acceptConnect();
                        });
                    });
                } else {
                    screens.switch("firstTime_intro");

                    navigator.notification.alert(
                        _("We couldn't finish setting up your account. Please contact our support service or try making a new account."),
                        function() {},
                        _("We have a major problem...")
                    );

                    $("#firstTime_signInButton").prop("disabled", false);
                    $("#firstTime_accept").prop("disabled", false);
                }
            } else if (localStorage.getItem("dataAcceptConnect") != "true") {
                firstTime_acceptConnect();
            } else if (localStorage.getItem("homeAddressSet") != "true") {
                screens.switch("firstTime_homeAddress");
            } else {
                screens.switch("home");

                tracking.start();
                awards.start();
                settings_currentUserSettings();
                family_currentMembersList();
            }
        } else {
            currentUser.uid = null;
            currentUser.username = null;
            currentUser.fullName = null;

            if (!firstTimeStatus.justSignedOut) {
                screens.switch("firstTime_intro");
            } else {
                firstTimeStatus.justSignedOut = false;
            }

            tracking.stop();

            if (currentUserSettingsReference != null) {
                currentUserSettingsReference.off();
            }

            if (currentFamilyReference != null) {
                currentFamilyReference.off();
            }
        }

        setTimeout(function() {
            $("#loader").fadeOut(500);
        }, 1000);
    });
}

$(function() {
    $("#settings_changeProfilePicture_fileUpload").on("change", function(event) {
        var file = event.target.files[0];

        if (file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".svg")) {
            
        } else {
            navigator.notification.alert(
                _("Please make sure that the file you have chosen is a picture."),
                function() {},
                _("Couldn't change profile picture")
            );
        }

        firebase.storage().ref("users/" + currentUser.uid + "/profile." + file.name.split(".").slice(1).pop()).put(file).then(function() {
            firebase.database().ref("users/" + currentUser.uid + "/profileImageType").set(file.name.split(".").slice(1).pop());

            var reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = function() {
                $(".myProfile").attr("src", reader.result);
            }
        }).catch(function() {
            setTimeout(function() {
                navigator.notification.alert(
                    _("Check your connection to the internet or try choosing a smaller picture."),
                    function() {},
                    _("Couldn't change profile picture")
                );
            });
        });
    });

    if (window.location.href.startsWith("https://") || window.location.href.startsWith("http://")) { // Features for PWA version
        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) { // Android
            $(".connectErrorInstructions").html(_("To fix permission issues, open Chrome, visit https://emux.proxi.app, tap the padlock (top-left), press <em>Site settings</em>, then press <em>Location access</em> and finally <em>Allow</em>. Then come back here and try again!"));
        } else {
            $(".connectErrorInstructions").html(_("To fix permission issues, open Settings, find and press <em>Safari</em>, then press <em>Location</em> and finally <em>Allow</em>. Then come back here and try again!"));
        }
    }

    var superSecretMessages = [
        "James was here!",
        "Why hello, developer!",
        "5,000+ lines of code!",
        "HtMl iS a PrOgRaMmInG lAnGuAgE!!1!11!",
        "JS FTW!",
        "Seriously Apple, fix your browser!",
        "Made by a bunch of teenagers™!",
        "There are 10 types of people in this world: those who know binary and those who don't!",
        "Well I never... Didn't know you're a developer!",
        "More super secret messages coming soon!",
        "CSSified!",
        "Clearly, something's gone wrong... Why else would you be here?!",
        "Typed by a human!",
        "Made in Norwich!",
        "Made by a team of just 4 people!",
        "Made for good, not for money!"
    ];
    
    console.log(superSecretMessages[Math.floor(Math.random() * superSecretMessages.length)]);
});

document.addEventListener("deviceready", appReady, false);

if (window.location.href.startsWith("https://") || window.location.href.startsWith("http://")) { // Features for PWA version
    appReady();
}