var img_preload = new Image();
var character;
var c_url = "";

var r_init = function() {

    if ($("#character").length > 0) {
        character = new Vue({
            el: "#character",
            data: {
                chr: {
                    BigImage: "", // unused
                    SmallImage: "",
                    GroupName: "",
                    RoleName: ""
                },
                bigimg: ""
            }
        });
    }
}

var h_load = function(h_url) {

    if (c_url != h_url) {
        c_url = h_url;
        $("#content_wrapper").load(h_url, function(res) {
            r_init();
        });

        /*$.ajax({
            type: "post",
            url: "search.html",
            dataType: 'html',
            async: false,
            success: function(res) {
                $("#content_wrapper").html(res);
                r_init();
            }
        });*/
    }
}

var query_img = function(name) {
    $.ajax({
        type: "GET",
        url: "query_chr?q=" + encodeURI(name),
        async: true,
        success: function(res) {
            if (res && res["success"]) {
                character.chr = res;
                //window.history.pushState(null, "FFX|V照片墙 - " + res["RoleName"], "http://viktorlab.net/ffwall/" + res["Id"].toString());
                document.title = "FFX|V照片墙 - " + res["RoleName"];
                img_preload.src = res["BigImage"];
                $("#start_wrapper").css("display", "none");
                $("#character").css("display", "block");
            }
        }
    });
};

$(document).ready(function() {
    character = new Vue({
        el: "#character",
        data: {
            chr: {
                BigImage: "", // unused
                SmallImage: "",
                GroupName: "",
                RoleName: ""
            },
            bigimg: ""
        }
    });

    img_preload.onload = function() {
        $("#bigimg").fadeTo(700, 0.3, function() {
            character.bigimg = img_preload.src;
        }).fadeTo(1000, 1);
    };

    $("#chr_name").autocomplete({
        source: function(request, response) {
            var name = request.term.trim();
            if (name.length >= 1) {
                $.ajax({
                    type: "GET",
                    url: "query_name?q=" + encodeURI(name),
                    async: true,
                    success: function(res) {
                        if (res) {
                            response(res.map(function(it) {
                                return {
                                    label: it["GroupName"] + " " + it["RoleName"],
                                    id: it["Id"],
                                    value: it["GroupName"] + " " + it["RoleName"]
                                };
                            }));
                        } else response([]);
                    }
                });
            } else { response([]); }
        },
        minChars: 1,
        select: function(event, ui) {
            //h_load("search.html");
            query_img(ui.item.id);
        }
    });

    $("#chr_name").keydown(function(e) {
        event = event || window.event;
        if (event.keyCode == 13) {
            //h_load("search.html");
            query_img($("#chr_name").val())
        }
    });

    $("#btn_submit").click(function() {
        //h_load("search.html");
        query_img($("#chr_name").val())
    });

    $("#bigimg").load(function() {
        $(this).hide;
        $(this).fadeIn(800);
    });

    $("#notice").modal();

    if (chr_id > 0) { query_img(chr_id); }
});