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
            extra: _("To win this award, you must go outside from your house and keep a 10m distance from others for 5 minutes. It's a challenge, but it'll help keep everyone safe!"),
            points: 10,
            icon: "directions_walk",
            wonTimes: 0
        },
        {
            name: _("Going Alone"),
            description: _("Keep 10m from others on 5 different days."),
            extra: _("This is similar to the <strong>A Solitary Walk</strong> award, but you get 15 extra points if you win that award 5 times on 5 different days!"),
            points: 15,
            icon: "nature",
            wonTimes: 0
        },
        {
            name: _("Staying In"),
            description: _("Stay at home for a full day."),
            extra: _("Take a rest for 24 hours ─ relax! Think about what you could do in that time: reading, playing games, or even baking some delicious food!"),
            points: 10,
            icon: "house",
            wonTimes: 0
        },
        {
            name: _("Keeping Cozy"),
            description: _("Stay indoors for 3 days in a row."),
            extra: _("If you're an introvert, this'll likely be easy ─ stay at home for a whole 36 hours. Make sure that you have enough to eat beforehand!"),
            points: 10,
            icon: "fireplace",
            wonTimes: 0
        },
        {
            name: _("Introvert"),
            description: _("Stay in your home for 5 whole days."),
            extra: _("Some may call you an introvert for staying at home for a whole 120 hours, but you can do <em>loads</em> of things in that time ─ if you're bored and haven't spoken to anyone lately, why don't you give a friend or family member a call!"),
            points: 10,
            icon: "king_bed",
            wonTimes: 0
        },
        {
            name: _("Part Of a Family"),
            description: _("Add one family member to your Proxi account."),
            extra: _("You get a whole 50 points if you add one person to the <strong>Family contacts</strong> section of Proxi! If they add you back as their first person, they can have 50 points too."),
            points: 50,
            icon: "people",
            wonTimes: 0
        },
        {
            name: _("Spread the Word"),
            description: _("Share Proxi on social media. Get 5 points per like!"),
            extra: _("Help promote Proxi! Post a positive message about Proxi to your favourite social media platform. If you can, include a link to <a href='javascript:window.open(\"https://emux.app\");'>emux.app</a> to help others find Proxi more easily! In order to claim your 5 points per like, you will need to fill in the quick form at <a href='javascript:window.open(\"https://emux.app/proxishare\");'>emux.app/proxishare</a> once your post has become sufficiently popular so that we can verify that you have got loads of likes."),
            points: 5,
            icon: "share",
            wonTimes: 0
        }
    ],
    points: 0,
    reference: null,
    tick: null
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
            if (snapshot.val() != true) {
                // A Solitary Walk
                if (awards.achievements[0].lastWon == null || new Date().getTime() - awards.achievements[0].lastWon >= AWARD_COOLDOWN_PERIOD) {
                    awards.win(0);
                }

                // Going Alone
                if (awards.achievements[0].wonTimes != 0 && awards.achievements[0].wonTimes != null && awards.achievements[0].wonTimes % 5 == 0) {
                    awards.win(1);
                }
            }

            firebase.database().ref("users/" + currentUser.uid + "/awards/statistics/beenIn10mContact").set(null);
        });
    }

    firebase.database().ref("users/" + currentUser.uid + "/awards/statistics/lastOutside").once("value", function(snapshot) {
        // Staying In
        if (
            (awards.achievements[2].lastWon == null || new Date().getTime() - awards.achievements[2].lastWon >= AWARD_FULL_DAY) &&
            new Date().getTime() - snapshot.val() >= AWARD_FULL_DAY
        ) {
            awards.win(2);
        }

        // Keeping Cozy
        if (
            (awards.achievements[3].lastWon == null || new Date().getTime() - awards.achievements[3].lastWon >= AWARD_FULL_DAY * 3) &&
            new Date().getTime() - snapshot.val() >= AWARD_FULL_DAY * 3
        ) {
            awards.win(3);
        }

        // Introvert
        if (
            (awards.achievements[4].lastWon == null || new Date().getTime() - awards.achievements[4].lastWon >= AWARD_FULL_DAY * 5) &&
            new Date().getTime() - snapshot.val() >= AWARD_FULL_DAY * 5
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
                for (var i = 0; i < Object.keys(snapshot.val().achievements).length; i++) {
                    var key = Object.keys(snapshot.val().achievements)[i];

                    if (snapshot.val().achievements[key] != null) {
                        var achievement = snapshot.val().achievements[key];

                        awards.achievements[key].lastWon = achievement.lastWon;
                        awards.achievements[key].wonTimes = achievement.wonTimes;
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
                    $("<button class='achievement'>")
                        .append([
                            $("<icon class='thumbnail' aria-hidden='true'>").text(achievement.icon),
                            $("<span class='points'>")
                                .attr("aria-label", _("{0} points", achievement.points))
                                .text(achievement.points)
                            ,
                            $("<strong>").text(achievement.name),
                            $("<span>").text(achievement.description),
                            $("<icon class='flippable' aria-hidden='true'>").text("arrow_forward_ios")
                        ])
                        .on("click", function() {
                            $(".achievementDetails .thumbnail").text(achievement.icon);
                            $(".achievementDetails .points").text(_("{0} points", [achievement.points]));

                            $(".achievementName").text(achievement.name);
                            $(".achievementDescription").text(achievement.description);
                            $(".achievementExtra").html(achievement.extra);

                            if (achievement.wonTimes != null && achievement.wonTimes > 0) {
                                var dateString = lang.format(new Date(achievement.lastWon), lang.language, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                });

                                $(".achievementProgress").text(_("Won {0} times, last won on {1}", [achievement.wonTimes, dateString]));
                            } else {
                                $(".achievementProgress").text(_("Not won by you yet"));
                            }

                            screens.moveForward("awards", "awards_achievement");
                        })
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

    clearInterval(awards.tick);

    awards.tick = setInterval(function() {
        awards.judge();
    }, 60 * 1000);
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