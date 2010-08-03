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
                console.log('done');
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
                .data( "item.autocomplete", item )
                .append( "<a>" + item.title + "<br>" + item.location + "</a>" )
                .appendTo( ul );
            };
    }
});
