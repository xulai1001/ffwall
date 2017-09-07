var img_preload = new Image();
var character;
var c_url = "";
var base_url = window.location.href.replace(/\/\d*$/, "/");
//var r_init = function() {}

// var h_load = function(h_url) {

//     if (c_url != h_url) {
//         c_url = h_url;
//         $("#content_wrapper").load(h_url, function(res) {
//             r_init();
//         });
//         /*$.ajax({
//             type: "post",
//             url: "search.html",
//             dataType: 'html',
//             async: false,
//             success: function(res) {
//                 $("#content_wrapper").html(res);
//                 r_init();
//             }
//         });*/
//     }
// }

var query_img = function(name) {
    $.ajax({
        type: "GET",
        url: "query_chr?q=" + encodeURI(name),
        async: true,
        success: function(res) {
            if (res && res["success"]) {
                character.chr = res;
                query_wy();
                window.history.pushState(null, "FFX|V照片墙 - " + res["RoleName"], base_url + res["Id"].toString());
                document.title = "FFX|V照片墙 - " + res["RoleName"];
                img_preload.src = res["BigImage"];

                $("#start_wrapper").css("display", "none");
                $("#character").css("display", "block");
            }
        }
    });
};

var query_wy = function() {
    character.details = {}
    $.ajax({
        type: "GET",
        url: "query_wy?q=" + encodeURI(character.chr.uid),
        async: true,
        success: function(res) {
            if (res && res["success"]) {
                character.complete = res["complete"];
                character.details = JSON.parse(res["details"]);
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
            bigimg: "",
            complete: 0,
            details: {}
        },
        methods: {
            render_wy: function (key, max) {
                var v = this.details[key];
                var cls = "btag ";
                var line = "";
                if (!v) { cls += "b-failed"; line=" 未完成 "; }
                else if (v == true) { cls += "b-success"; line=" 已完成 "; }
                else {
                    console.log(v.value);
                    line = "  " + v.value.toString() + "  /  " + max.toString() + "  ";
                    if (v.ok) { cls+="b-success"; } else cls+="b-warn";
                }
                return '<span class="' + cls + '">' + line + '</span>';
            }
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

    /* $("#wy_btn").click(function() {
         //h_load("search.html");
         if ($("#wy_details").css("display") == "none") {
             $("#wy_details").show();
         } else {
             $("#wy_details").hide();
         }
     });*/


    $("#bigimg").load(function() {
        $(this).hide;
        $(this).fadeIn(800);
    });

    $("#notice").modal();

    if (chr_id > 0) { query_img(chr_id); }
    if ($(window).width() < 768) { $("#wy_details").collapse('show');}
});