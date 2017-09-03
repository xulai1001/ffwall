$(document).ready(function() {

    var character = new Vue({
        el: "#character",
        data: {
            chr: {
                BigImage: "",
                SmallImage: "",
                GroupName: "",
                RoleName: ""
            }
        }
    });

    $("#chr_name").autocomplete({
        source: function(request, response) {
            var name = request.term.trim();
            if (name && name.length >= 1)
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
            else
                response([]);
        }
    });

    $("#chr_name").keydown(function(e) {
        event = event || window.event;
        if (event.keyCode == 13) {
            var name = $("#chr_name").val();
            $.ajax({
                type: "GET",
                url: "query_chr?q=" + name,
                async: true,
                success: function(res) {
                    if (res && res["success"]) {
                        character.chr = res;
                        $("#start_wrapper").css("display", "none");
                        $(".main_wrapper").css("display", "block");
                    }
                }
            });
        }
    });

    $("#btn_submit").click(function() {
        var name = $("#chr_name").val();
        $.ajax({
            type: "GET",
            url: "query_chr?q=" + name,
            async: true,
            success: function(res) {
                if (res && res["success"]) {
                    character.chr = res;
                    $("#start_wrapper").css("display", "none");
                    $(".main_wrapper").css("display", "block");
                }
            }
        });
    });
});