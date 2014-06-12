
var winW,
	winH,
	winS = $(window).scrollTop(),
	isMobile = false,
	isTablet = false,
	tabletThr = 1024,				// tablet threshold
	mobileThr = 720,				// mobile threshold
	header,							// header
	hH = 56,						// header height
	pR = 4;							// paralax ratio
	stThr = 10,						// scroll top threshold for navigation to be compacted, px
	slideshowTiming = 3000,			// timing for slide to change
	uA = navigator.userAgent.toLowerCase(),
	doc = document.documentElement;

// Setting os specific attribute to html
doc.setAttribute('data-useragent', uA);
/* alert(uA); */

$.ajaxSetup({ cache: false }); // Prevents caching

function initOnLoad() {
	
	adjustContent();
	slideSwitcher( $("#testimonials") );
	formActionHandler( $("#contact-form"), "php/sendmail.php" );
	if ( !isMobile ) { buildBGParalax( $(".bg-paralax-fx") ); }
	buildNavigation( $("#header-nav") );
	
	buildTabs( $("ul.tabs") );
	buildAccordion( $("ul.accordion") );
	buildPortfolio( $(".portfolio") );
	
	if ( $(".slideshow").length > 0 ) { buildSlideshow( $(".slideshow") ); }
	
}

function goGA( event, category, label ) {
	
	// Checking if Analytics is enabled
	if ( typeof(ga) == "function" ) { ga('send', 'event', category, event, label); }
	else { console.log( "goGA: Google Analytics was not initialized properly." ); }
	
}

function initOnReady() {
	
	header = $("#main-header");

}

$(document).on({
	ready: function(){
		initOnReady();
	}
});

$(window).on({

	load: function(){
		initOnLoad();
	},
	
	scroll: function(){				
		winS = $(window).scrollTop();
		
		if ( winS >= stThr ) { header.addClass("compact"); }
		else { header.removeClass("compact"); }
		
	},
	
	resize: function(){
		getWindowDimensions();
		adjustContent();
	}
	
});

function getWindowDimensions(){

	winH = $(window).height();
	winW = $(window).width();
	
	if ( winW < tabletThr ) { isTablet = true; } else { isTablet = false; }
	if ( winW < mobileThr ) { isMobile = true; } else { isMobile = false; }
	
}

function adjustContent(){
	
	// 0. Getting window dimensions
	
	getWindowDimensions();
	
	// 2. Adjusting testimonials slideshow
	
	var liMH = 0,
		ulH = 0;
	
	$("#testimonials-container")
		.find("li")
		.each(
			function(){
				var liH = $(this).height();
				if ( liH > liMH ){
					liMH = liH;
					ulH = liMH;
					$("#testimonials-container").height( ulH );
				}	
		})
		.each(
			function(){
				var liH = $(this).height();
				
				if ( liH < ulH ) {
					$(this).css({
						//top: (ulH-liH)/2
					});
				}
		});	
	
}

function slideSwitcher( slideShow ) {
	
	var slides = slideShow.find(".slides"),
		slideNav = slideShow.find(".slide-nav"),
		slideNavItems = slideShow.find(".slide-nav li");
		
	slideNavItems
		.on({
			click: function(){
				var slideInd = $(this).index();
				slideNavItems.removeClass("current");
				$(this).addClass("current");
				
				slides
					.find("li")
					.removeClass("current")
					.eq(slideInd)
					.addClass("current");
				
				return false;
			}
		});
	
}

function formActionHandler( form, actionURL ){
	
	form.on({
		submit: function(){
			
			$(this).removeClass("sent");
			
			var reqEmpty = $(this).find(".required").filter( function(){ return $(this).val() == ""; }),
				data = "";
				
			$(this).find(".invalid").removeClass("invalid");
			
			if ( reqEmpty.length !== 0 ) {
				reqEmpty
					.first()
					.addClass("invalid")
					.focus();
			} else {
			
				data = $(this).serialize();
							
				$.ajax({
					type: "POST",
					url: actionURL,
					data: data,
					beforeSend: function(){ form.addClass("standby"); },
					success: function( data ) {
						form.addClass("sent");
						setTimeout(function(){ resetForm( form ); }, 2000 );
					}
				});
			}
			
			return false;
		}
	});
	
	function resetForm( form ) {
		form.find("input, textarea").val("");
	}
	
}

function getBGImgSizes( objs ) {

	var outputArr = [];

	objs.each(
		function(){
			var objInd = $(this).index(),
				objBGI = $(this).css("background-image").replace(/url\(|\)|\"/gm, "");
				img = new Image(),
				objBGS = parseInt($(this).css("background-size"),10);
			
			img.src = objBGI;
			
			var bgW = img.width,
				bgH = img.height,
				bgR = bgW/bgH;
				
			if ( objBGS ) {
				bgW = objBGS;
				bgH = bgW/bgR;
			}
			
			outputArr.push( bgW + "x" + bgH );
		}
	);
	
	return outputArr;

}

function buildBGParalax ( objs ) {
	
	var objsArr = getBGImgSizes( objs );	
	
	objs.each(function(){
	
		var obj = $(this);
	
		$(window).on({
			scroll: function(){
				var oT = obj.offset().top,
					oH = obj.height(),
					oBP = obj.css("background-position"),
					oIS = objsArr[obj.index()-1];
					
					oBP = oBP.split(" ");
					oIS = oIS.split(/x/);
				
				var oIH = oIS[1],
					oBPx = oBP[0]; 
					
				if ( winS >= oT && winS < oT+oH) {
					obj.css({
						backgroundPosition: oBPx + " " + ((oH-oIH)+winS/pR) +"px"
					});
				}
				
			},
			resize: function(){
				
				// window resize fix
				objs.attr("style", "");

			}
		});
		
	});
	
}

function buildNavigation ( nav ) {
	
	var items = nav.find("li a");
	
	if ( isMobile || isTablet ) {
		$("#wrapper").swipe({
			threshold: 75,
			allowPageScroll: "vertical",
			swipeLeft: function() {
				if ( !$("body").hasClass("show-nav") ){ $("body").addClass("show-nav"); }
			},
			swipeRight: function() {
				if ( $("body").hasClass("show-nav") ){ $("body").removeClass("show-nav"); }
			},
			tap: function(){
				if ( $("body").hasClass("show-nav") ){ $("body").removeClass("show-nav"); } 
			}
			
		});
	}
	
	$("#nav-trigger").on({
		click: function(){
			$("body").toggleClass("show-nav");
			return false;
		}
	});
	
}

function buildTabs( container ){
	
	container
		.each(function(){
		
			$(this)
				.wrap("<div class='nrg-tabs-container'></div>")
				.parent()
				.prepend("<p class='list-nav'></p>");	
			
			var li = $(this).find("li"),
				tC = $(this).parent(),
				nav = tC.find(".list-nav"),
				liMH = 0;
				
			li
				.each(function(){
					var tabHeader = $(this).find(".tab-header").text();
					
					$(this).wrapInner("<div class='tab-container'></div>");
					nav.append("<a href='#'>"+tabHeader+"</a>");
					
					var liH = $(this).find(".tab-container").outerHeight();
					if ( liH > liMH ) { liMH = liH; }
					
				})
				.first()
				.addClass("active");
			
			var tabs = nav.find("a");
			
			tabs
				.on({
					click: function(){
						var i = $(this).index();
						
						tabs.removeClass("current");
						$(this).addClass("current");
						
						li.removeClass("active").eq(i).addClass("active");
						
						return false;
					}
				})
				.first()
				.addClass("current");
			
			$(this).height( liMH );
			
		});
	
	$(window).on({
		resize: function(){
			container
				.each(function(){
					var li = $(this).find("li"),
						liMH = 0;						
					li.each(function(){
						var liH = $(this).find(".tab-container").outerHeight();
						if ( liH > liMH ) { liMH = liH; }							
					});
					$(this).height( liMH );		
				});
		}
	});
	
}

function buildAccordion( container ){
	
	container
		.each(function(){
		
			var li = $(this).find("li"),
				liL = li.length;
			
			li
				.each(function(){
				
					var head = $(this).find(".tab-header").wrapInner("<a href='#'></a>");
					
					$(this)
						.wrapInner("<div class='tab-container'></div>")
						.find(".tab-header")
						.remove();
					
					var tC = $(this).find(".tab-container"),
						tcH = tC.height();
					
					$(this).prepend(head);
					
					buildClickInteraction( li, head, tcH );
					
				})
				.addClass("hidden");
		});
	
	$(window).on({
		resize: function(){
			container
				.each(function(){
					var li = $(this).find("li"),
						tC = li.find(".tab-container");
						
					tC.wrapInner("<div class='tab-content'></div>");
					
					li.each(function(){
						var tCont = $(this).find(".tab-content"),
							head = $(this).find(".tab-header"),
							tcH = tCont.height();
						
						if ( !$(this).hasClass("hidden") ) { $(this).find(".tab-container").height(tcH); }	
						
						buildClickInteraction( li, head, tcH );		
						tCont.find("*").unwrap();	 
				
					});
				});
		}
	});
	
	function buildClickInteraction( li, head, tcH ) {
		head
			.find("a")
			.css({ display: "block" })
			.off("click")
			.on({
				click: function(){					
					li
						.addClass("hidden")
						.find(".tab-container")
						.height(0);
					$(this)
						.parent()
						.parent()
						.removeClass("hidden")
						.find(".tab-container")
						.height(tcH);
					return false;
				}
			});

	}
	
}

function buildPortfolio( container ) {
	
	var filter = container.find(".portfolio-filter"),
		items = container.find(".portfolio-item"),
		zoom = items.find(".zoom-in");
		
	items.each(function(){
		var imgURL = $(this).find(".portfolio-item-cover img").attr("src"),
			desc = $(this).find(".portfolio-item-description");
			
		desc.prepend("<div class='portfolio-item-description-bg'></div>");
			
		var descBG = desc.find(".portfolio-item-description-bg"),
			descBGI = descBG.css("background-image");
		
		descBG.css({
			backgroundImage: descBGI + ", url(" + imgURL + ")"
		});		
			
	});
	
	filter.find("a").on({
	
		click: function(){
			var iC = $(this).attr("class")
				cat = iC.match(/cat-\w*/),
				showAll = iC.match(/show-all/),
				fI = filter.find("li a");
			
			fI.removeClass("active");
			$(this).addClass("active");
			
			if ( showAll ) {
				items.removeClass("hidden");
			} else {
					
				items
					.addClass("hidden")
					.filter("."+cat)
					.removeClass("hidden");
			
			}
			
			return false;
		}
	});
	
	zoom.on({
		click: function(){
			var item = $(this).parent().parent().parent(),
				img = item.find(".portfolio-item-cover img"),
				imgSrc = img.attr("src"),
				imgH = (winH/100)*80,
				imgHTML = "<img id='portfolio-fs-img' src='"+imgSrc+"' alt='' />";	
			
			buildContentOverlay( imgHTML );
			
			return false;
		}
	});
	
}

function buildContentOverlay( html ) {
		
	$("body")
		.append("<div class='content-overlay'><div class='container'></div></div>")
		.find(".content-overlay .container")
		.prepend( html )
		.on({
			click: function(){
				destroyContentOverlay();
			}
		});
	
	
	$(window).on({
		keyup: function(e){
			if ( e.keyCode == 27 ) {
				destroyContentOverlay();
			}
		}
	})
		
		console.log(html);
		
}

function destroyContentOverlay() {
	
	$(".content-overlay").addClass("fade-out");
	setTimeout( function(){ $(".content-overlay").remove() }, 500 );
	
}

function buildSlideshow( container ) {
	
	container.each(function(){
		
		$(this).append("<ul class='slideshow-nav'></ul>");
	
		var cont = $(this),
			slides = cont.find(".slide"),
			sNav = cont.find(".slideshow-nav"),
			sL = slides.length,
			sH = slides.outerHeight(),
			sW = slides.outerWidth()
			fS = slides.first(),
			timeout = 0;
			
		cont.height( sH );
		
		$(window).on({
			resize: function(){
				sH = slides.outerHeight(),
				sW = slides.outerWidth();
				cont.height( sH );
			}
		})

		slides.each(function(){
			sNav.append("<li><a href='#'>" + $(this).index() + "</a></li>");
		});
		
		sNav
			.find("li")
			.first()
			.addClass("active");
		
		sNav
			.find("li a")
			.on({
				click: function(){
					var ind = $(this).parent().index();
					changeSlide( ind );
					return false;
				}
			});
				
		fS.addClass("active");
		timeout = setTimeout( function() { changeSlide( 1 ); }, slideshowTiming );
		
		function changeSlide( ind ) {
			var nextInd;
			
			if ( ind >= sL-1 ) { nextInd = 0; } else { nextInd = ind+1; }
			
			slides
				.removeClass("active")
				.eq(ind)
				.addClass("active");
			
			sNav
				.find("li")
				.removeClass("active")
				.eq(ind)
				.addClass("active");
			
			window.clearTimeout(timeout);
			timeout = setTimeout( function() { changeSlide( nextInd ); }, slideshowTiming );	
		
		}
		
	});
	
}