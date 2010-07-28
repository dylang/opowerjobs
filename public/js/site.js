$(document).ready(function(){
    $(".scrollable").scrollable({circular: true});

    $('.logo').bind('click', function(){
        document.location = '/';
    });
});