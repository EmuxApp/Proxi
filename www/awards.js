/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Closed-Source Licence, which can be found at LICENCE.md.
*/

const AWARD_COOLDOWN_PERIOD = 12 * 60 * 60 * 1000; // 12 hours
const AWARD_FULL_DAY = 24 * 60 * 60 * 1000; // 1 day

var awards = {
    achievements: [
        {
            name: _("A Solitary Walk"),
            description: _("Keep a 10m distance from others when outside."),
            points: 10,
            icon: "directions_walk",
            wonTimes: 0
        },
        {
            name: _("Going Alone"),
            description: _("Keep 10m from others on 5 different days."),
            points: 15,
            icon: "nature_local",
            wonTimes: 0
        },
        {
            name: _("Staying In"),
            description: _("Stay at home for a full day."),
            points: 10,
            icon: "house",
            wonTimes: 0
        },
        {
            name: _("Keeping Cozy"),
            description: _("Stay indoors for 3 days in a row."),
            points: 10,
            icon: "fireplace",
            wonTimes: 0
        },
        {
            name: _("Introvert"),
            description: _("Stay in your home for 5 whole days."),
            points: 10,
            icon: "king_bed",
            wonTimes: 0
        },
        {
            name: _("Part Of a Family"),
            description: _("Add one family member to your Proxi account."),
            points: 50,
            icon: "people",
            wonTimes: 0
        },
        {
            name: _("Spread the Word"),
            description: _("Share Proxi on social media. Get 5 points per like!"),
            points: 5,
            icon: "share",
            wonTimes: 0
        }
    ],
    points: 0,
    reference: null
};

awards.getLP = function(points) {
    return {
        level: Math.floor(points / 100) + 1,
        points: points % 100
    };
};

awards.win = function(award) {
    firebase.database().ref("users/" + currentUser.uid + "/awards/achievements/" + award).set({
        wonTimes: awards.achievements[award].wonTimes + 1,
        lastWon: firebase.database.ServerValue.TIMESTAMP
    });

    firebase.database().ref("users/" + currentUser.uid + "/awards/points").set(awards.points + awards.achievements[award].points);
};

awards.judge = function(hasBeenOutside = false) {
    if (hasBeenOutside) {
        firebase.database().ref("users/" + currentUser.uid + "/awards/statistics/beenIn10mContact").once("value", function(snapshot) {
            if (!snapshot.val() && hasBeenOutside) {
                // A Solitary Walk
                if (awards.achievements[0].lastWon == null || new Date().getTime() - awards.achievements[0].lastWon >= AWARD_COOLDOWN_PERIOD) {
                    awards.win(0);
                }

                // Going Alone
                if (awards.achievements[0].wonTimes != 0 && awards.achievements[0].wonTimes != null && awards.achievements[0].wonTimes % 5 == 0) {
                    awards.win(1);
                }
            }
        });
    }

    firebase.database().ref("users/" + currentUser.uid + "/awards/statistics/lastOutside").once("value", function(snapshot) {
        // Staying In
        if (
            (awards.achievements[0].lastWon == null || new Date().getTime() - awards.achievements[0].lastWon >= AWARD_FULL_DAY) &&
            snapshot.val() >= AWARD_FULL_DAY
        ) {
            awards.win(2);
        }

        // Keeping Cozy
        if (
            (awards.achievements[0].lastWon == null || new Date().getTime() - awards.achievements[0].lastWon >= AWARD_FULL_DAY * 3) &&
            snapshot.val() >= AWARD_FULL_DAY * 3
        ) {
            awards.win(3);
        }

        // Introvert
        if (
            (awards.achievements[0].lastWon == null || new Date().getTime() - awards.achievements[0].lastWon >= AWARD_FULL_DAY * 5) &&
            snapshot.val() >= AWARD_FULL_DAY * 5
        ) {
            awards.win(4);
        }
    });
};

awards.start = function() {
    if (awards.reference != null) {
        awards.reference.off();
        
        awards.reference = null;
    }

    awards.reference = firebase.database().ref("users/" + currentUser.uid + "/awards");

    awards.reference.on("value", function(snapshot) {
        if (snapshot.val() != null) {
            awards.points = snapshot.val().points || 0;

            if (snapshot.val().achievements != null) {
                for (var i in snapshot.val().achievements) {
                    if (snapshot.val().achievements[i] != null) {
                        var achievement = snapshot.val().achievements[i];

                        awards.achievements[i].lastWon = achievement.lastWon;
                        awards.achievements[i].wonTimes = achievement.wonTimes;
                    }
                }
            }
        }

        $(".levelText").text(_("Level {0}", [awards.getLP(awards.points).level]));
        $(".pointsText").text(_("{0} points", [awards.getLP(awards.points).points]));

        $(".levelMedal").attr("src", awards.getLP(awards.points).level < 5 ? "media/levels/" + awards.getLP(awards.points).level + ".svg" : "media/levels/5.svg");
        $(".pointsProgress").val(awards.getLP(awards.points).points);

        var achievementsWon = 0;
        var goalsToDo = 0;

        $(".achievementsList").html("");
        $(".goalsList").html("");

        for (var i = 0; i < awards.achievements.length; i++) {
            (function(achievement) {
                $(achievement.wonTimes == 0 ? ".goalsList" : ".achievementsList").append(
                    $("<button class='achievement'>").append([
                        $("<icon class='thumbnail' aria-hidden='true'>").text(achievement.icon),
                        $("<span class='points'>")
                            .attr("aria-label", _("{0} points", achievement.points))
                            .text(achievement.points)
                        ,
                        $("<strong>").text(achievement.name),
                        $("<span>").text(achievement.description),
                        $("<icon class='flippable' aria-hidden='true'>").text("arrow_forward_ios")
                    ])
                );
                
                if (achievement.wonTimes == 0) {
                    goalsToDo++;
                } else {
                    achievementsWon++;
                }
            })(awards.achievements[i]);
        }

        if (achievementsWon == 0) {
            $(".achievementsList").html("");

            $(".achievementsList").append([
                $("<h3 class='center'>").text(_("No achievements yet!")),
                $("<p class='center'>").text(_("Start completing goals to make them show up here."))
            ]);
        }
        
        if (goalsToDo == 0) {
            $(".goalsList").html("");

            $(".goalsList").append([
                $("<h3 class='center'>").text(_("You've won all of the achievements!")),
                $("<p class='center'>").text(_("Congratulations! Repeat your achievements again to level up, and keep your eyes peeled for any new achievements here!"))
            ]);
        }
    });
};

awards.stop = function() {
    if (awards.reference != null) {
        awards.reference.off();

        awards.reference = null;
    }
};

$(function() {
    firebase.database().ref("users").orderByChild("awards/points").limitToLast(20).on("value", function(snapshot) {
        var topUsers = [];

        snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.val().awards != null && childSnapshot.val().awards.points != null) {
                topUsers.unshift({username: childSnapshot.val().username, points: childSnapshot.val().awards.points});
            }
        });

        $(".leaderboardList").html("");

        if (topUsers.length > 0) {
            var lastPoints = null;

            for (var i = 0; i < topUsers.length; i++) {
                $(".leaderboardList").append(
                    $("<button class='leaderboardPosition'>").append([
                        $("<strong>").text(topUsers[i].points == lastPoints ? "=" : i + 1),
                        $("<span>").text(topUsers[i].username),
                        $("<span>").text(topUsers[i].points)
                    ])
                );

                lastPoints = topUsers[i].points;
            }
        } else {
            $(".leaderboardList").append([
                $("<h3 class='center'>").text(_("Couldn't get the leaderboard")),
                $("<p class='center'>").text(_("Check your connection to the internet, or try again later."))
            ]);
        }
    });
});