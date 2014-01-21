/* Full Page Image Slideshow
* Created: Oct 4th, 2013 by DynamicDrive.com. This notice must stay intact for usage 
* Author: Dynamic Drive at http://www.dynamicdrive.com/
* Visit http://www.dynamicdrive.com/ for full source code
*/



;(function($){
	var has_3d;
	var img_cache = {};

	// these properties can be fetched from the playlist_url
	var remote_loadable = [
		"preload_images",
		"anim_fps",
		"transition_time",
		"hold_time",
		"loops"
	];

	// these are the default values
	var defaults = {
		"debug":false,
		"preload_images":-1, // preload all images
		"playlist":null,
		"playlist_url":null,
		"throbber":null,
		"anim_fps":20,
		"transition_time":2, // seconds
		"hold_time":4,
		"on_image_change":null,
		"on_images_loaded":null,
		"loops":null // number of times the images will loop
	};

	//--------------------


	function has3DTransform() {
		var has_3d;
		var div = document.createElement('div');
		var properties = ['perspectiveProperty', 'WebkitPerspective'];
		div.id = '_test_div_';

		for (var i = properties.length - 1; i >= 0; i--){
			if (div.style[properties[i]] != undefined) {
				var st = document.createElement('style');
				st.textContent = '@media (-webkit-transform-3d){#_test_div_{height:3px}}';
				document.getElementsByTagName('head')[0].appendChild(st);
				document.body.appendChild(div);
				has_3d = (div.offsetHeight === 3);
				st.parentNode.removeChild(st);
				div.parentNode.removeChild(div);
				if (has_3d) return has_3d;
			}
		}
		return false;
	}

	function hasAnyProp(obj, props) {
		for (var i = 0; i < props.length; i++) {
			if (obj.hasOwnProperty(props[i])) return true;
		}
		return false;
	}

	function getProp(obj, prop, def) {
		if (obj && obj.hasOwnProperty(prop)) {
			return(obj[prop]);
		} else {
			return def;
		}
	}

	//----------------------

	function panelObject($parent, id, img_url, transition, caption, on_ready) {
		var self = this;
		var img_w = 1;
		var img_h = 1;
		var tx = 0;
		var ty = 0;
		var scale = 1;

		var vp_scale = 1;
		var ctr_x;
		var ctr_y;
		var vp_ctr_x;
		var vp_ctr_y;

		var from_x;
		var from_y;
		var from_zoom;
		var to_x;
		var to_y;
		var to_zoom;
		var $display_node;
		var width;
		var height;

		var is_visible;

		var ready = false;


		function initPanel() {
			var img = new Image();
			var $img = $(img);
			$img.load(function() {
				img_w = img.width;
				img_h = img.height;
				ctr_x = 0;
				ctr_y = 0;
				$img.remove();
				$display_node.css("width",img_w);
				$display_node.css("height",img_h);
				self.setTransition(transition);
				self.checkResize();
				ready = true;
				if (on_ready) on_ready(self);
			});

			$is_visible=true;
	
			$display_node = $("<div class ='smooth_slider_panel'></div>");
			$display_node.append($img);
			$display_node.css("background-image","url("+img_url+")");
			self.setOpacity(0);
			img.src = img_url;
			$parent.append($display_node);
		}
			
		this.getId = function() {
			return id;
		}

		this.checkResize = function() {
			width = $parent.width();
			height = $parent.height();
			var vp_aspect = width / (height<1?1:height);
			var p_aspect;


			p_aspect = img_w / (img_h<1?1:img_h);

			if (vp_aspect > p_aspect) {
				vp_scale = width / (img_w<1?1:img_w);
			} else {
				vp_scale = height / (img_h<1?1:img_h);
			}

			ctr_x = (img_w - width) *0.5;
			ctr_y = (img_h - height) *0.5;

			//if (vp_scale < 1) vp_scale = 1;
	
			this.transform(tx, ty, scale);
		}

		this.getImageUrl = function() {
			return img_url;
		}

		this.getImageCaption = function() {
			return caption?caption:"";
		}

		var transform2d = function(px, py, _scale) {
			scale = _scale;
			_scale *= vp_scale;
			var mtx = "matrix("+_scale+",0,0,"+_scale+","+(px*vp_scale-ctr_x)+","+(py*vp_scale-ctr_y)+")";
			$display_node.css("transform",mtx).css("-ms-transform",mtx).css("-webkit-transform",mtx);
		}

		var transform3d = function(px, py, _scale) {
			scale = _scale;
			_scale *= vp_scale;
			var mtx = "matrix3d("+_scale+",0,0,0,0,"+_scale+",0,0,0,0,1,0,"+(px*vp_scale-ctr_x)+","+(py*vp_scale-ctr_y)+",0,1)";

			$display_node.css("transform",mtx).css("-ms-transform",mtx).css("-webkit-transform",mtx);
		}


		this.transform =  has_3d ? transform3d : transform2d;


		this.setTargetTransform = function(_from_x, _from_y, _from_zoom, _to_x, _to_y, _to_zoom) {
			from_x = _from_x;
			from_y = _from_y;
			from_zoom = _from_zoom;
			to_x = _to_x;
			to_y = _to_y;
			to_zoom = _to_zoom;
		}

		this.setTransitionPos = function(t) {
			this.transform(
					(to_x-from_x) * t + from_x,
					(to_y-from_y) * t + from_y,
					(to_zoom-from_zoom) * t + from_zoom);
		}



		this.randomTransition = function(tr) {
			var s1, s2, x1, y1, x2, y2;

			if (has_3d) {
				s1 = Math.random()*0.5 + 1.0;
				s2 = Math.random()*0.5 + 1.0;
				x1 = (Math.random()-0.5)*(s1-1)*img_w;
				y1 = (Math.random()-0.5)*(s1-1)*img_h;
				x2 = (Math.random()-0.5)*(s2-1)*img_w;
				y2 = (Math.random()-0.5)*(s2-1)*img_h;
			} else {
				var hint = getProp(tr,'hint','auto');
				var s;
				switch (hint) {
					case "zoom": s = 0.3333 * Math.random(); break;
					case "hpan": s = 0.3333 * Math.random() + 0.3333; break;
					case "vpan": s = 0.3333 * Math.random() + 0.6666; break;
					default: s = Math.random();
				}
				s1 = s2 = Math.random()*0.8 + 1.2;
				x1 = y1 = x2 = y2 = 0;
				if (s < 0.3333) {
					if (s < 0.166667) {
						s2 = s1 + Math.random()*0.5;
					} else {
						s1 = s2 + Math.random()*0.5;
					}
				} else if (s < 0.6666) {
					x1 = (Math.random()-0.5)*(s1-1)*img_w;
					x2 = (Math.random()-0.5)*(s2-1)*img_w;
				} else {
					y1 = (Math.random()-0.5)*(s1-1)*img_h
					y2 = (Math.random()-0.5)*(s2-1)*img_h;
				}
			}

			self.setTargetTransform(x1,y1,s1, x2,y2,s2);
		}

		this.setTransition = function(tr) {
			if (tr == null) {
				this.randomTransition(tr);
				return;
			}

			var s1, s2, x1, y1, x2, y2;
			var w2 = img_w / 2;
			var h2 = img_h / 2;

			x1 = -getProp(tr,'x1',w2) + w2;
			y1 = -getProp(tr,'y1',h2) + h2;
			x2 = -getProp(tr,'x2',w2) + w2;
			y2 = -getProp(tr,'y2',h2) + h2;

			z1 = getProp(tr,'z1',1);
			z2 = getProp(tr,'z2',1);

			// make sure the zoom is adequate for the given coordinates

			var zs1 = 2*Math.max(Math.abs(x1)/img_w, Math.abs(y1)/img_h)+1;
			var zs2 = 2*Math.max(Math.abs(x2)/img_w, Math.abs(y2)/img_h)+1;

			var u = getProp(tr,'uniform',0);

			var z = Math.max(zs1,zs2);

			// regarding base zoom (zoom with s1=1 and s2=1)
			// when u == 1 zoom is uniform (same zoom throught the image)
			// when u == 0 zoom is adjusted at the beginning and at the end of the transition to fit the image
			z1 *= (z-zs1) * u + zs1;
			z2 *= (z-zs2) * u + zs2;

			x1 *= z1-1;
			y1 *= z1-1;

			x2 *= z2-1;
			y2 *= z2-1;

			if (!has_3d) {
				// reduce mobility to only one movement (panning or zooming)... try to guess
				// which is more appropriate
				var hint = getProp(tr,'hint','auto')
				switch (hint) {
					case "zoom": case "hpan": case "vpan": break;
					default:
						var s = (z1>z2 ? z1/z2 : z2/z1)-1;
						var x = Math.abs(x2-x1) / img_w;
						var y = Math.abs(y2-y1) / img_h;

						if (s > x) {
							if (s > y) {
								hint = "zoom";
							} else {
								hint = "vpan";
							}
						} else { 
							if (x > y) {
								hint = "hpan";
							} else {
								hint = "vpan";
							}
						}
					
				}

				switch (hint) {
					case "zoom":
						if (z1 < z2) { // zoom out
							x2 = x1; y2 = y1;
						} else { // zoom in
							x1 = x2; y1 = y2;
						} break;
					case "hpan":
						if (z1 < z2) {
							y2 = y1; z1 = z2;
						} else {
							y1 = y2; z2 = z1;
						} break;
					case "vpan":
						if (z1 < z2) {
							x2 = x1; z1 = z2;
						} else {
							x1 = x2; z2 = z1;
						} break;
				}
			}

			self.setTargetTransform(x1,y1,z1, x2,y2,z2);
		}

		this.setOpacity = function(op) {
			if (op < 0) op = 0;
			else if (op > 1) op = 1;
			if (op == 0) {
				if (is_visible) {
					$display_node.hide();
					is_visible = false;
				}
			} else {
				if (!is_visible) {
					$display_node.show();
					is_visible = true;
				}
			}
			$display_node.css('opacity', op);
		}

		this.setDepth = function(z) {
			$display_node.css("z-index",z);
		}

		this.finishedLoading = function() {
			return ready;
		}

		initPanel();
	}

	//----------------------

	function resizerObject($container, settings) {
		var self = this;

		var playlist;
		var throbber = 1;
		var tot_images = 0;
		var current_image = 0;
		var paused = false;
		var current_loop;

		var ticker_var;

		var fade_time = 1;
		var anim_time = 1;

		var panel_a, panel_b;

		var frame_time;

		var fade_start_time = anim_time - fade_time;

		var ticker_state = 0;
		var current_anim_time = 0;

		self.$container = $container;

		$container.addClass("smooth_slider_container noflicker");

		var panels = [];

		function rotatePanels() {
			panel_a = panel_b;
			panel_b += 1;
			if (panel_b == tot_images) panel_b = 0;

			panels[panel_a].setDepth(20);
			panels[panel_b].setDepth(10);

			if (current_loop != null && panels[panel_b].getId() == 0) {
				current_loop--;
				if (current_loop == 0) {
					current_loop = settings['loops'];
					self.pause();
				}
			}
		}

		function getImageList() {
			var img_list = [];
			for (var i = from; i < tot_images; i++) {
				img_list.push(playlist[i]['url']);
			}
			return img_list;
		}

		//----

		function imagesReady() {
			if (settings['throbber']) $(settings['throbber']).fadeOut();
			recalcExtents();

			if (settings['on_images_loaded']) {
				settings['on_images_loaded']();
			}

			if (settings['on_image_change']) {
				settings['on_image_change'](panels[panel_b].getImageCaption(), panels[panel_b].getImageUrl());
			}

			now = new Date().getTime();
			ticker_var = setInterval(ticker, frame_time);

			current_anim_time = 0;//anim_time - fade_time;
		}
		
		function playlistReady() {
			current_loop = settings['loops'];
			frame_time = 1000.0/settings['anim_fps'];

			for (var i = 0; i < playlist.length; i++) {
				if (!playlist[i].hasOwnProperty('url')) {
					playlist.splice(i, 1);
					i--;
				}
			}

			tot_images = playlist.length;

			fade_time = Math.round(settings['transition_time'] * 1000.0);
			anim_time = Math.round((2*settings['transition_time'] + settings['hold_time']) * 1000.0);
			fade_start_time = anim_time - fade_time;
			// now preload all the required images

			var to_load = tot_images;
			for (var i = 0; i < tot_images; i++) {
				var img = playlist[i];
				panels.push(new panelObject($container, i, img['url'],
						img.hasOwnProperty('slide')?img['slide']:null,
						img.hasOwnProperty('caption')?img['caption']:null,
						function(panel) {
							to_load--;
							if (to_load == 0) imagesReady();
						}
						));
			}
			panel_a = tot_images-1;
			panel_b = 0;
		}

		this.pause = function() {
			if (settings['on_pause']) settings['on_pause'].call(this);
			paused = true;
		}

		this.resume = function() {
			if (settings['on_resume']) settings['on_resume'].call(this);
			paused = false;
		}


		function ticker() {
			var dt = new Date().getTime() - now;
			now += dt;
			// cap the time delta, mostly to compensate when the browser slows down the ticker
			if (dt > 2*frame_time) dt = frame_time*2;

			if (current_anim_time < fade_time) {
				ticker_state = 0;
				// this will only happen at the very beginning
				panels[panel_b].setOpacity( current_anim_time / fade_time );
				panels[panel_b].setTransitionPos( current_anim_time / anim_time);
			} else if (ticker_state == 0) { // current_anim_time == fade_time
				panels[panel_a].setOpacity(0);
				panels[panel_b].setOpacity(1);
				rotatePanels();
				ticker_state = 1;
			} else if (current_anim_time >= fade_start_time) {
				if (ticker_state == 1) { //current_anim_time == fade_start_time
					if (paused)  return;
					ticker_state = 2;
					if (settings['on_image_change']) {
						settings['on_image_change'].call(this,panels[panel_b].getImageCaption(), panels[panel_b].getImageUrl());
					}
					panels[panel_b].setOpacity(1);
				}
				// front panel fades out
				var rel_frame = (current_anim_time - fade_start_time);
				panels[panel_a].setOpacity(1.0 - rel_frame / fade_time);
				panels[panel_a].setTransitionPos( current_anim_time / anim_time);
				panels[panel_b].setTransitionPos( rel_frame / anim_time);

				if (current_anim_time >= anim_time) {
					current_anim_time -= (anim_time-fade_time);
					ticker_state = 0;
				}
			} else {
				// animate back panel (front panel is hidden)
				panels[panel_a].setTransitionPos( current_anim_time / anim_time);
			}
			current_anim_time += dt;
		}

		function recalcExtents() {
			for (var i = 0; i < tot_images; i++) {
				panels[i].checkResize();
			}
		}

		function mergeRemoteSettings(data) {
			for (i = 0; i < remote_loadable.length; i++) {
				var prop = remote_loadable[i];
				if (data.hasOwnProperty(prop)) {
					settings[prop] = data[prop];
				}
			}
		}


		//----


		$(window).resize(recalcExtents);


		if (settings['throbber']) $(settings['throbber']).fadeIn();

		// if we need to load the playlist from the server do so
		if (settings.playlist_url) {
			$.getJSON(settings.playlist_url, null, function(data, textStatus, jqXHR) {
				playlist = data['playlist'];
				mergeRemoteSettings(data);
				if (settings['debug']) {
					for (var key in settings) {
						console.log(key+"->"+settings[key]);
					}
				}
				playlistReady();
			});
		} else {
			playlist = settings['playlist'];
			tot_images = playlist.length;
			playlistReady();
		}

	}

	//----------------------

	$.fn.smoothslider = function(action, options) {
		var settings = $.extend({}, defaults, options);

		switch(action) {
			case "install":
				has_3d = has3DTransform();
				return this.each(function() {
					var obj = new resizerObject($(this), settings);

					obj.$container.data("smoothslider",obj);
				});
				break;
			case "resume":
				return this.each(function() {
					var $this = $(this);
					$this.data("smoothslider").resume();
				});
				break;
			case "pause":
				return this.each(function() {
					var $this = $(this);
					$this.data("smoothslider").pause();
				});
				break;
				
		}
	}
})(jQuery);

(function($){
 	$.fn.extend({
 		fade_swap: function(text, time, easing) {
			if (time === undefined) time = 1000;
			if (easing === undefined) easing = "swing";

    		return this.each(function() {
				var $area = $(this);
				$area.animate({"opacity": 0}, time, easing, function() {
					$area.text(text);
					$area.animate({"opacity": 1}, time, easing);
				});
			});
		}
	});
})(jQuery);
