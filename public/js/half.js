/*
 * @author dylan.greene
 */


/*
 * $(selector).half() -- adds 20px to all nodes with the class .half
 */
(function($) {

    $.fn.half = function(/*config*/) {
        //var options = {};
        //if (config) $.extend(options, config);

        this.find('.half').each(function() {
            $(this)
                .removeClass('half')
                .width($(this).width() + 20);
        });

        return this;
    };

 })(jQuery);
