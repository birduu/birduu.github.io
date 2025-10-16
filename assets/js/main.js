/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Background cycling functionality with AVIF support and proper loading
	var backgroundImages = ['bg1.png', 'bg2.png'];
	var currentBgIndex = 0;
	var bgCycleInterval;
	var bgElement = document.getElementById('bg');
	var supportsAVIF = false;
	var preloadedImages = {};
	var isTransitioning = false;

	// Detect AVIF support once on page load
	function detectAVIFSupport() {
		var canvas = document.createElement('canvas');
		if (canvas.getContext && canvas.getContext('2d')) {
			try {
				var avifDataURL = canvas.toDataURL('image/avif');
				supportsAVIF = avifDataURL.indexOf('data:image/avif') === 0;
			} catch (e) {
				supportsAVIF = false;
			}
		}
		console.log('AVIF support detected:', supportsAVIF);
		return supportsAVIF;
	}

	// Preload all background images for smooth transitions
	function preloadBackgroundImages() {
		var imagesToLoad = [];
		
		// Create list of images to preload (both AVIF and PNG fallbacks)
		backgroundImages.forEach(function(baseImage) {
			if (supportsAVIF) {
				imagesToLoad.push({
					url: 'images/' + baseImage.replace(/\.(png|jpg|jpeg)$/i, '.avif'),
					type: 'AVIF',
					base: baseImage
				});
			}
			imagesToLoad.push({
				url: 'images/' + baseImage,
				type: 'PNG',
				base: baseImage
			});
		});

		// Load each image
		imagesToLoad.forEach(function(imageInfo) {
			var img = new Image();
			img.onload = function() {
				preloadedImages[imageInfo.base + '_' + imageInfo.type] = true;
				console.log('Preloaded:', imageInfo.url);
			};
			img.onerror = function() {
				console.log('Failed to preload:', imageInfo.url);
			};
			img.src = imageInfo.url;
		});
	}

	function cycleBackground() {
		if (isTransitioning) return; // Prevent overlapping transitions
		
		isTransitioning = true;
		
		// Randomly select a background image
		var randomIndex = Math.floor(Math.random() * backgroundImages.length);
		var newBgImage = backgroundImages[randomIndex];
		
		console.log('Starting background cycle for:', newBgImage);
		
		// Determine which format to use
		var imageUrl, format;
		if (supportsAVIF) {
			imageUrl = 'images/' + newBgImage.replace(/\.(png|jpg|jpeg)$/i, '.avif');
			format = 'AVIF';
		} else {
			imageUrl = 'images/' + newBgImage;
			format = 'PNG';
		}
		
		console.log('Attempting to load:', imageUrl, '(' + format + ')');
		
		// Create a temporary image to ensure it's loaded before applying
		var tempImg = new Image();
		tempImg.onload = function() {
			console.log('Image loaded successfully:', imageUrl);
			
			// Image is loaded, now apply it to the background
			var styleId = 'bg-cycle-style';
			var existingStyle = document.getElementById(styleId);
			if (existingStyle) {
				existingStyle.remove();
			}
			
			var style = document.createElement('style');
			style.id = styleId;
			style.textContent = '#bg:after { background-image: url("' + imageUrl + '") !important; }';
			document.head.appendChild(style);
			
			console.log('Background cycled to:', imageUrl, '(' + format + ')');
			isTransitioning = false;
		};
		
		tempImg.onerror = function() {
			console.log('Failed to load image:', imageUrl);
			
			// If AVIF fails, fallback to PNG
			if (supportsAVIF && format === 'AVIF') {
				console.log('AVIF failed, falling back to PNG');
				imageUrl = 'images/' + newBgImage;
				format = 'PNG';
				
				var fallbackImg = new Image();
				fallbackImg.onload = function() {
					console.log('PNG fallback loaded successfully:', imageUrl);
					
					var styleId = 'bg-cycle-style';
					var existingStyle = document.getElementById(styleId);
					if (existingStyle) {
						existingStyle.remove();
					}
					
					var style = document.createElement('style');
					style.id = styleId;
					style.textContent = '#bg:after { background-image: url("' + imageUrl + '") !important; }';
					document.head.appendChild(style);
					
					console.log('Background cycled to:', imageUrl, '(' + format + ' - fallback)');
					isTransitioning = false;
				};
				
				fallbackImg.onerror = function() {
					console.log('PNG fallback also failed:', imageUrl);
					console.log('Keeping existing background or CSS fallback');
					isTransitioning = false;
				};
				
				fallbackImg.src = imageUrl;
			} else {
				console.log('No fallback available, keeping existing background');
				isTransitioning = false;
			}
		};
		
		tempImg.src = imageUrl;
	}

	// Test function to force a background immediately
	function testBackground() {
		console.log('Testing background with PNG directly...');
		var styleId = 'bg-cycle-style';
		var existingStyle = document.getElementById(styleId);
		if (existingStyle) {
			existingStyle.remove();
		}
		
		var style = document.createElement('style');
		style.id = styleId;
		style.textContent = '#bg:after { background-image: url("images/bg1.png") !important; }';
		document.head.appendChild(style);
		
		console.log('Applied test background: images/bg1.png');
	}

	// Background carousel initialization (will be called from main load handler)
	function initializeBackgroundCarousel() {
		console.log('Initializing background carousel...');
		
		// Detect AVIF support first
		detectAVIFSupport();
		
		// Test with immediate PNG background first
		setTimeout(function() {
			console.log('Testing immediate background...');
			testBackground();
		}, 200);
		
		// Preload background images for smooth transitions
		preloadBackgroundImages();
		
		// Set initial background after a short delay to allow preloading
		setTimeout(function() {
			console.log('Starting background cycling...');
			cycleBackground();
		}, 800); // Increased delay to ensure is-preload is removed first
		
		// Set up periodic cycling (every 30 seconds)
		bgCycleInterval = setInterval(cycleBackground, 30000);
		
		// Allow manual cycling by clicking on the header
		$header.on('click', function(e) {
			// Only trigger if clicking on the header itself, not on navigation links
			if (e.target === this || $(e.target).closest('.content').length > 0) {
				cycleBackground();
			}
		});
		
		// Add keyboard shortcut for testing (Ctrl+B)
		$(document).on('keydown', function(e) {
			if (e.ctrlKey && e.keyCode === 66) { // Ctrl+B
				e.preventDefault();
				console.log('Manual background test triggered');
				cycleBackground();
			}
		});
	}

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
				
				// Initialize background carousel after removing is-preload
				initializeBackgroundCarousel();
			}, 100);
		});

	// Fix: Flexbox min-height bug on IE.
		if (browser.name == 'ie') {

			var flexboxFixTimeoutId;

			$window.on('resize.flexbox-fix', function() {

				clearTimeout(flexboxFixTimeoutId);

				flexboxFixTimeoutId = setTimeout(function() {

					if ($wrapper.prop('scrollHeight') > $window.height())
						$wrapper.css('height', 'auto');
					else
						$wrapper.css('height', '100vh');

				}, 250);

			}).triggerHandler('resize.flexbox-fix');

		}

	// Nav.
		var $nav = $header.children('nav'),
			$nav_li = $nav.find('li');

		// Add "middle" alignment classes if we're dealing with an even number of items.
			if ($nav_li.length % 2 == 0) {

				$nav.addClass('use-middle');
				$nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

			}

	// Main.
		var	delay = 325,
			locked = false;

		// Methods.
			$main._show = function(id, initial) {

				var $article = $main_articles.filter('#' + id);

				// No such article? Bail.
					if ($article.length == 0)
						return;

				// Handle lock.

					// Already locked? Speed through "show" steps w/o delays.
						if (locked || (typeof initial != 'undefined' && initial === true)) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Mark as visible.
								$body.addClass('is-article-visible');

							// Deactivate all articles (just in case one's already active).
								$main_articles.removeClass('active');

							// Hide header, footer.
								$header.hide();
								$footer.hide();

							// Show main, article.
								$main.show();
								$article.show();

							// Activate article.
								$article.addClass('active');

							// Unlock.
								locked = false;

							// Unmark as switching.
								setTimeout(function() {
									$body.removeClass('is-switching');
								}, (initial ? 1000 : 0));

							return;

						}

					// Lock.
						locked = true;

				// Article already visible? Just swap articles.
					if ($body.hasClass('is-article-visible')) {

						// Deactivate current article.
							var $currentArticle = $main_articles.filter('.active');

							$currentArticle.removeClass('active');

						// Show article.
							setTimeout(function() {

								// Hide current article.
									$currentArticle.hide();

								// Show article.
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

				// Otherwise, handle as normal.
					else {

						// Mark as visible.
							$body
								.addClass('is-article-visible');

						// Show article.
							setTimeout(function() {

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

			};

			$main._hide = function(addState) {

				var $article = $main_articles.filter('.active');

				// Article not visible? Bail.
					if (!$body.hasClass('is-article-visible'))
						return;

				// Add state?
					if (typeof addState != 'undefined'
					&&	addState === true)
						history.pushState(null, null, '#');

				// Handle lock.

					// Already locked? Speed through "hide" steps w/o delays.
						if (locked) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Deactivate article.
								$article.removeClass('active');

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								$body.removeClass('is-article-visible');

							// Unlock.
								locked = false;

							// Unmark as switching.
								$body.removeClass('is-switching');

							// Window stuff.
								$window
									.scrollTop(0)
									.triggerHandler('resize.flexbox-fix');

							return;

						}

					// Lock.
						locked = true;

				// Deactivate article.
					$article.removeClass('active');

				// Hide article.
					setTimeout(function() {

						// Hide article, main.
							$article.hide();
							$main.hide();

						// Show footer, header.
							$footer.show();
							$header.show();

						// Unmark as visible.
							setTimeout(function() {

								$body.removeClass('is-article-visible');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								// Unlock.
									setTimeout(function() {
										locked = false;
									}, delay);

							}, 25);

					}, delay);


			};

		// Articles.
			$main_articles.each(function() {

				var $this = $(this);

				// Close.
					$('<div class="close">Close</div>')
						.appendTo($this)
						.on('click', function() {
							location.hash = '';
						});

				// Prevent clicks from inside article from bubbling.
					$this.on('click', function(event) {
						event.stopPropagation();
					});

			});

		// Events.
			$body.on('click', function(event) {

				// Article visible? Hide.
					if ($body.hasClass('is-article-visible'))
						$main._hide(true);

			});

			$window.on('keyup', function(event) {

				switch (event.keyCode) {

					case 27:

						// Article visible? Hide.
							if ($body.hasClass('is-article-visible'))
								$main._hide(true);

						break;

					default:
						break;

				}

			});

			$window.on('hashchange', function(event) {

				// Empty hash?
					if (location.hash == ''
					||	location.hash == '#') {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Hide.
							$main._hide();

					}

				// Otherwise, check for a matching article.
					else if ($main_articles.filter(location.hash).length > 0) {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Show article.
							$main._show(location.hash.substr(1));

					}

			});

		// Scroll restoration.
		// This prevents the page from scrolling back to the top on a hashchange.
			if ('scrollRestoration' in history)
				history.scrollRestoration = 'manual';
			else {

				var	oldScrollPos = 0,
					scrollPos = 0,
					$htmlbody = $('html,body');

				$window
					.on('scroll', function() {

						oldScrollPos = scrollPos;
						scrollPos = $htmlbody.scrollTop();

					})
					.on('hashchange', function() {
						$window.scrollTop(oldScrollPos);
					});

			}

		// Initialize.

			// Hide main, articles.
				$main.hide();
				$main_articles.hide();

			// Initial article.
				if (location.hash != ''
				&&	location.hash != '#')
					$window.on('load', function() {
						$main._show(location.hash.substr(1), true);
					});

})(jQuery);