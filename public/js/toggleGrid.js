/*
 * @author dylan.greene
 *
 * Control-G will toggle a visible grid on #content.
 *
 * $(selector).toggleGrid() will toggle a grid on any element.
 *
 */


(function ($) {

    // this is only set up when in debug mode (aka running locally)


    //for autocomplete.
    $.toggleGrid = function() {};
    $.widget("ei.toggleGrid", {
        options: {
            opacity: 0.2,
            columnWidth: 20,
            width: 0,
            height: 0
        },
        showing: false,


        _init: function() {
            if (this.showing) {
                //hide bars
                this.$container
                        .find('DIV')
                        .stop()
                        .animate({ height: 0 }, 800);
            }
            else {
                //show bars
                this.$container
                        .find('DIV')
                        .stop()
                        .animate({ height: this.options.height }, 800);
            }

            this.showing = !this.showing;

         },

        _create: function() {

            var $el = $(this.element);


            this.options.height = $el.height();
            this.options.width = $el.width();
            this.$container = $('<div/>')
                                .addClass('toggleGrid')
                                .css({
                top: $el.css('paddingTop'),
                left: $el.css('paddingLeft')

                                });


            for (var i = 0, j = Math.floor(this.options.width/this.options.columnWidth); i < j; i = i + 2 )
            {
                $('<div/>')
                            .addClass('gridline')
                            .css({
                                left: i * this.options.columnWidth,
                                opacity: this.options.opacity,
                                width: this.options.columnWidth
                            })
                        .appendTo(this.$container);
            }
            var $previousColumn, height = this.options.height, opacity = this.options.opacity;
            this.$container.find('DIV').bind(
                {
                    click: function() {
                        if ($previousColumn) {
                            $previousColumn.stop().animate({height: height}, 'fast');
                        }

                        $(this).stop().animate({ height: 0 }, 'fast');

                        $previousColumn = $(this);

                    },

                    mouseenter: function() {
                        $(this).animate({opacity: opacity * 2}, 'fast');
                    },

                    mouseleave: function() {
                        $(this).animate({opacity: opacity}, 'fast');
                    }

                });

            this.$container.appendTo(document.body).position({
                my: 'left top',
                at: 'left top',
                of: $el,
                offset: $el.css('paddingLeft') + ' ' + $el.css('paddingTop'),
                collision: 'none'

            });
        }
    });

    //press control-G to show the grid
    var isCtrl = false;
    $(document).keyup(function (e) {
            if(e.keyCode == 17) {
                    isCtrl = false;
            }
        }).keydown(function (e) {
            if(e.keyCode == 17) {
                    isCtrl = true;
            }
            if(e.keyCode.toString() == 71 && isCtrl) {
                $('.container').toggleGrid();
                e.preventDefault();
            }
        });

})(jQuery);
