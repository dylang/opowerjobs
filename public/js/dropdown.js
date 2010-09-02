/*
 * @author garrett.miller
 */

(function ($) {

    //this line is for autocomplete purposes only
    //it should have good usage docs here.
    $.dropdown = function() {};

    $.widget('ei.dropdown', {

        // default options
        options: {
        },

        _init: function() {
            //ei.log('this runs every time $(selector).yourPlugin() runs');

        },
        _create: function() {
            this.$source   = this.element.hide().attr('tabIndex', -1);

            var self = this,
                $parent  = this.element.parent().parent(),
                $selected = this.$source.find("option:selected"),
                $items  = this.$source.find('option');

            // Create container
            this.$container = $('<div class="dropdown-container">'
                                + '<dl class="dropdown" role="option">'
                                    + '<dt>'
                                        + '<a href="#" class="rounded nofollow dropdown-href">'
                                            + '<span class="text">' + $selected.text() + '</span>'
                                            + '<span class="arrow">'
                                                + '<div class="icon-arrow arrow-down-4 icon-size-4"> </div>'
                                            + '</span>'
                                        + '</a>'
                                    + '</dt>'
                                    + '<dd>'
                                        + '<ul class="rounded-bl rounded-br"></ul>'
                                    + '</dd>'
                                + '</dl>'
                            + '</div>'
                            );
            this.$dropdown = this.$container.find('.dropdown-href');
            this.$choices = this.$container.find('ul');

            // Create var for maximum text size
            var maxLength = 0;

            // Loop through each option from original selector
            $items.each(function(i){
                $('<li class="option-' + i + '">'
                    + '<a href="#" class="nofollow">'
                        + $(this).text()
                        + '<span class="value">'
                            + $(this).val()
                        + '</span>'
                    + '</a>'
                + '</li>')
                .addClass($(this).val() == $selected.val() ? 'active' : '')
                .appendTo(self.$choices);


                maxLength = Math.max(maxLength, $(this).text().length);
            });

            // Style accordingly
            // Magic number up a new width
            // TODO: Make this work with text /width/ rather than text /length/ above
            var dropdownWidth = maxLength * 12;

            this.$dropdown
                    .css({ width: dropdownWidth })
                    .attr('tabIndex', 0);

            this.$choices
                    .css({ width: dropdownWidth + 18 });

            this._bindEvents();

            //add to the DOM last for speed
            this.$container.appendTo($parent);

        },

        _bindEvents: function() {

            var $links = this.$choices.find('A'),
                $container = this.$container,
                self = this,
                menuShowing = false;

            $container
                .bind('focusout',function() {
                    self.$dropdown.removeClass('active');
                    self.$choices.hide();
                    menuShowing = false;
                })
                .bind('focusin',function() {
                    self.$dropdown.addClass('active');
                    self.$choices.show();
                    menuShowing = true;
                });

            //This is for Safari 4 which seems to have issues bubbling the focus/blur events.
            this.$dropdown
                    .bind('mousedown', function() {
                            if (menuShowing) {
                                this.blur();
                            } else {
                                this.focus();
                            }
                        });

            //clicking on items in the dropdown
            $links
                .bind('mousedown',function() {

                    // Get new selected value from clicked element's hidden span
                    var $link = $(this),
                        origValue = self.$source.val(),
                        newValue = $link.children('.value').html(),
                        newLabel = $link.html();

                    self.$dropdown
                        .blur()
                        .find('.text')
                            .html(newLabel);

                    // Update the form
                    if(origValue != newValue) {
                         self.$choices.children('li').removeClass('active');
                         $link.parent('li').addClass('active');

                        // Change the dropdown to the new value and update the dropdown list class
                        self.$source
                            .val(newValue)
                            .change();  //fires change event
                    }
                });

            $links.bind('focus blur', function(){
                $(this).toggleClass('hover');
            });

        },


        destroy: function() {
            $.Widget.prototype.destroy.apply(this, arguments); // default destroy
        }
    });

})(jQuery);
