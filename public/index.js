$(document).ready(function() {

    var character = new Vue({
        el: "#character",
        data: {
            chr: {
                BigImage: "",   // unused
                SmallImage: "",
                GroupName: "",
                RoleName: ""
            },
            bigimg: ""
        }
    });

    var img_preload = new Image();
    img_preload.onload = function() {
        $("#bigimg").fadeTo(700, 0.3, function() {
            character.bigimg = img_preload.src;
        }).fadeTo(1000, 1);        
    };

    var query_img = function(name) {
        $.ajax({
            type: "GET",
            url: "query_chr?q=" + name,
            async: true,
            success: function(res) {
                if (res && res["success"]) {
                    character.chr = res;
                    img_preload.src = res["BigImage"];
                    $("#start_wrapper").css("display", "none");
                    $(".main_wrapper").css("display", "block");
                }
            }
        });
    };

    $("#chr_name").autocomplete({
        source: function(request, response) {
            var name = request.term.trim();
            if (name.length>=1) {
                $.ajax({
                    type: "GET",
                    url: "query_name?q=" + name,
                    async: true,
                    success: function(res) {
                        if (res) {
                            response(res);
                        } else response([]);
                    }
                });
            } else { response([]); }
        },
        minChars: 1,
        select: function(event, ui) { query_img(ui.item.value); } 
    });

    $("#chr_name").keydown(function(e) {
        event = event || window.event;
        if (event.keyCode == 13) { query_img($("#chr_name").val()); }
    });

    $("#btn_submit").click(function () { query_img($("#chr_name").val()); });

    $("#bigimg").load(function() {
        $(this).hide;
        $(this).fadeIn(800); 
    });

});
