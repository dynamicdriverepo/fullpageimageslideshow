# Full Page Image slideshow #

*Description:* This is a supersized slideshow that automatically expands to fill up the container it's in to let you display a slideshow that either covers the entire visible screen, or a certain section inside the page.  Each image is panned or zoomed in and out into view, adding intrigue and flare.

## Directions ##

*Step 1:* This script uses the following external files:

+ jQuery 1.10 or above (served via Google CDN)
+ jquery-slider.js 
+ smooth_slider.css
+ playlist.json
+ images.zip

*Step 2:* Add the below code to the HEAD section of your page:

	<link rel="stylesheet" type="text/css" href="smooth_slider.css">

	<style>
	
	.slideshowwrapper{ /* dimensions of outermost slideshow container */
		width: 80%;
		height: 600px;
		position: relative;
		overflow: hidden;
	}
	
	</style>

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script src="jquery-slider.js">

		/***********************************************
		* Full Page Slideshow- (c) Dynamic Drive DHTML code library (www.dynamicdrive.com)
		* This notice MUST stay intact for legal use
		* Visit Dynamic Drive at http://www.dynamicdrive.com/ for this script and 100s more
		***********************************************/

	</script>
	<script>
		$(function() {
			$('#resume').on('click', function(){ // set up resume button behavior
				$("#pan_area").smoothslider("resume") // resume playing of this slideshow. Pass in "pause" to pause it instead
				$(this).hide() // hide resume button
			})
		
		
			$("#pan_area").smoothslider("install", {
				"playlist_url":"playlist.json", // get the playlist and some config from the server

				// this function gets called whenever there's an image change
				"on_image_change":function(caption, image_url) { 
						var area= $("#img_msg_area").find("span");
						area.animate({"opacity": 0}, 500, "swing", function() {
							area.text(caption);
							area.animate({"opacity": 1}, 500); // fade in & out take 500ms each
						});
					},
				"loops": 2, // number of loops before stopping. Remove thisoption to run continuously
				"throbber":$("#throbber"), // an image to show when waiting for images to load
				on_pause:function(){
					$('#resume').show()
				}

			});
		});

	</script>


*Step 3:* Then, add the below sample markup to your page:

	<div class="slideshowwrapper">
		<div id="throbber"><img src="img/throbber.gif"></div>
		<div id="resume" style="display:none">Replay</div>
		<div id="pan_area"></div>
		<div id="img_msg_area"><span></span></div>
		<div id="static_text_area">There is nothing more amazing than nature, the miracle that is every creature in her domain. The birds, the lions, down to every insect, together they form the circle of life that supports each other.</div>
	</div>

## Full Page Image slideshow Set up ##

See script project page for additional details on setup and documentation: <http://www.dynamicdrive.com/dynamicindex14/fullpageslideshow/index.htm>
