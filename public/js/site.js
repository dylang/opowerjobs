$(document).ready(function(){


    $('.fancybox').fancybox({
        onStart: function() { $('body').addClass('fancybox-visible');},
        onClosed: function() { $('body').removeClass('fancybox-visible');},
        cyclic: true
    });


    window.addthis_config = {
        username: 'opower',
        data_ga_tracker: 'UA-17897272-1'
    };

});


