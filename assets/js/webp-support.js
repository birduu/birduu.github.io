/**
 * WebP Support Detection and Image Optimization
 * Automatically serves WebP images when supported, falls back to original formats
 */

(function() {
    'use strict';

    // WebP support detection
    function supportsWebP() {
        return new Promise(function(resolve) {
            var webP = new Image();
            webP.onload = webP.onerror = function() {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Convert image src to WebP version
    function getWebPVersion(src) {
        if (src.indexOf('.webp') !== -1) return src;
        
        var lastDot = src.lastIndexOf('.');
        if (lastDot === -1) return src;
        
        return src.substring(0, lastDot) + '.webp';
    }

    // Optimize all images on the page
    function optimizeImages() {
        var images = document.querySelectorAll('img[src$=".png"], img[src$=".jpg"], img[src$=".jpeg"]');
        
        images.forEach(function(img) {
            // Skip if already wrapped in picture element
            if (img.parentNode.tagName === 'PICTURE') {
                return;
            }
            
            var originalSrc = img.src;
            var webpSrc = getWebPVersion(originalSrc);
            
            // Create picture element for better WebP support
            var picture = document.createElement('picture');
            var webpSource = document.createElement('source');
            webpSource.srcset = webpSrc;
            webpSource.type = 'image/webp';
            
            // Wrap the original img in picture element
            img.parentNode.insertBefore(picture, img);
            picture.appendChild(webpSource);
            picture.appendChild(img);
        });
    }

    // Optimize CSS background images
    function optimizeBackgroundImages() {
        // Handle dynamic background images from JavaScript
        var bgElement = document.getElementById('bg');
        if (bgElement) {
            var style = window.getComputedStyle(bgElement, '::after');
            var bgImage = style.backgroundImage;
            
            if (bgImage && bgImage !== 'none') {
                // Check if it's a background image that can be optimized
                var imageMatch = bgImage.match(/url\("?([^"]+)"?\)/);
                if (imageMatch && imageMatch[1]) {
                    var imageUrl = imageMatch[1];
                    if (imageUrl.match(/\.(png|jpg|jpeg)$/i)) {
                        var webpUrl = getWebPVersion(imageUrl);
                        
                        // Update CSS custom property for WebP
                        document.documentElement.style.setProperty(
                            '--bg-image-webp', 
                            'url("' + webpUrl + '")'
                        );
                    }
                }
            }
        }
    }

    // Initialize WebP optimization
    function initWebPOptimization() {
        supportsWebP().then(function(webpSupported) {
            if (webpSupported) {
                // Add WebP class to body for CSS targeting
                document.body.classList.add('webp-supported');
                
                // Optimize images
                optimizeImages();
                optimizeBackgroundImages();
                
                console.log('WebP optimization enabled - faster loading!');
            } else {
                console.log('WebP not supported - using original formats');
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWebPOptimization);
    } else {
        initWebPOptimization();
    }

    // Also run after page load for dynamically added content
    window.addEventListener('load', function() {
        setTimeout(optimizeImages, 100);
    });

})();
