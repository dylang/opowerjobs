$(document).ready(function(){

    $("ul.droplink li.target").append('<span class="arrow icon-arrow arrow-down-3"> </span>');

	$("ul.droplink li.target").click(function() { //When trigger is clicked...
        
        $(this).addClass('active');
        
		//Following events are applied to the subnav itself (moving subnav up and down)
		$(this).parent().find("ul.subnav")
		    .slideDown('fast').show(); //Drop down the subnav on click

		$(this).parent().hover(function() {
		}, function(){
            $("ul.droplink li.target").removeClass('active');
            $("ul.droplink ul.subnav").hide();
		});

		//Following events are applied to the trigger (Hover events for the trigger)
		}).hover(function() {
			$(this).addClass("subhover"); //On hover over, add class "subhover"
		}, function(){	//On Hover Out
			$(this).removeClass("subhover"); //On hover out, remove class "subhover"
	});

});