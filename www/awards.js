/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Closed-Source Licence, which can be found at LICENCE.md.
*/

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

awards.start = function() {
    if (awards.reference != null) {
        awards.reference.off();
        
        awards.reference = null;
    }

    awards.reference = firebase.database().ref("users/" + currentUser.uid + "/awards");

    awards.reference.on("value", function(snapshot) {
        if (snapshot.val() != null) {
            awards.points = snapshot.val().points || 0;
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
            $(".achievementsList").append([
                $("<h3 class='center'>").text(_("No achievements yet!")),
                $("<p class='center'>").text(_("Start completing goals to make them show up here."))
            ]);
        } else {
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