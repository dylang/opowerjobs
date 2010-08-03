$(document).ready(function(){
    $(".scrollable").scrollable({circular: true});

    $('.logo').bind('click', function(){
        document.location = '/';
    });

    function fix_query(query) {
        return (query || '').replace(/[^a-zA-Z]/g, ' ').trim().replace(/\s+/g, '-')
    }

    var $q = $('#q');

    if ($q.length) {

        $('.search').bind('submit', function() {

            var search_for = fix_query($q.val());
            document.location = '/jobs/search/' + search_for;

            return false;
        });


        var cache = {};
        $q.autocomplete({
            minLength: 2,
            source: function(request, response) {
                if ( request.term in cache ) {
                    response( cache[ request.term ] );
                    return;
                }

                var query = fix_query(request.term);

                $.ajax({
                    url: '/jobs/search/' + query + '/json',
                    dataType: "json",
                    data: request,
                    success: function( data ) {
                        cache[ request.term ] = data;
                        response( data );
                    }
                });
            },
            select: function(event, ui) {
                document.location = ui.item.url;
            }
        })
        .bind('focus', function() {
            if ($q.val() && $q.autocomplete("widget").not(":visible")) {
                $q.autocomplete("search", $q.val());
            }
        })
        .data( "autocomplete" )._renderItem = function( ul, item ) {
            if (!item) { return; }

            if ('count' in item) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( item.count ? '<a>' + 'All ' + item.count + ' matches.' + '</a>' : 'No matches')
                    .appendTo( ul );
            }

            return $( "<li></li>" )
                .data( 'item.autocomplete', item )
                .append( '<a>' + item.title + '<br><span class="sub">' + item.location + '</span></a>' )
                .appendTo( ul );
            };
    }

  if (!('placeholder' in document.createElement('input'))) {
    $this = $q;
    var placeholder = $this.attr('placeholder');

    var insert_placeholder = function() {
        if ($this.val() === '') {
        $this.val(placeholder);
        $this.addClass('placeholder');
        }
    };

    var remove_placeholder = function() {
        if ($this.val() === placeholder) {
        $this.val('');
        $this.removeClass('placeholder');
        }
    };

    $this.bind('focus', remove_placeholder);
    $this.bind('blur', insert_placeholder);
    // https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/Function/Apply
    insert_placeholder.apply(this);

    // prevent submission with default placeholder
    $this.parents('form').bind('submit', function() {
        remove_placeholder();
    });
  }
});
