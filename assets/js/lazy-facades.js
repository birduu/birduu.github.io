/**
 * Lazy Loading Facades for Third-Party Resources
 * Defers loading of external resources until they're needed for better performance
 */

(function() {
    'use strict';

    // Configuration for different resource types
    const FACADE_CONFIG = {
        youtube: {
            selector: '.youtube-facade',
            placeholderClass: 'youtube-placeholder',
            loadingClass: 'youtube-loading',
            loadedClass: 'youtube-loaded'
        },
        fonts: {
            selector: '.font-facade',
            placeholderClass: 'font-placeholder',
            loadingClass: 'font-loading',
            loadedClass: 'font-loaded'
        },
        social: {
            selector: '.social-facade',
            placeholderClass: 'social-placeholder',
            loadingClass: 'social-loading',
            loadedClass: 'social-loaded'
        }
    };

    // YouTube lazy loading facade
    class YouTubeFacade {
        constructor(element) {
            this.element = element;
            this.videoId = element.dataset.videoId;
            this.title = element.dataset.title || 'Video';
            this.thumbnail = element.dataset.thumbnail;
            this.isLoaded = false;
            
            this.createPlaceholder();
            this.setupIntersectionObserver();
        }

        createPlaceholder() {
            // Create a beautiful placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'youtube-placeholder';
            placeholder.innerHTML = `
                <div class="video-thumbnail" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    width: 100%;
                    height: 300px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                ">
                    <div class="play-button" style="
                        width: 80px;
                        height: 80px;
                        background: rgba(255,255,255,0.9);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        color: #333;
                        transition: all 0.3s ease;
                    ">
                        ▶
                    </div>
                    <div class="video-title" style="
                        position: absolute;
                        bottom: 15px;
                        left: 15px;
                        right: 15px;
                        color: white;
                        font-weight: bold;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                        font-size: 0.9em;
                    ">
                        ${this.title}
                    </div>
                    <div class="loading-overlay" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.8);
                        display: none;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                    ">
                        Loading Video...
                    </div>
                </div>
            `;

            // Add click handler
            placeholder.addEventListener('click', () => this.loadVideo());
            
            // Add hover effects
            const thumbnail = placeholder.querySelector('.video-thumbnail');
            const playButton = placeholder.querySelector('.play-button');
            
            thumbnail.addEventListener('mouseenter', () => {
                thumbnail.style.transform = 'scale(1.02)';
                thumbnail.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
                playButton.style.transform = 'scale(1.1)';
                playButton.style.background = 'rgba(255,255,255,1)';
            });
            
            thumbnail.addEventListener('mouseleave', () => {
                thumbnail.style.transform = 'scale(1)';
                thumbnail.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
                playButton.style.transform = 'scale(1)';
                playButton.style.background = 'rgba(255,255,255,0.9)';
            });

            this.element.appendChild(placeholder);
        }

        loadVideo() {
            if (this.isLoaded) return;
            
            this.isLoaded = true;
            const placeholder = this.element.querySelector('.youtube-placeholder');
            const loadingOverlay = placeholder.querySelector('.loading-overlay');
            
            // Show loading state
            loadingOverlay.style.display = 'flex';
            
            // Create iframe
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${this.videoId}?autoplay=1&rel=0&modestbranding=1`;
            iframe.title = this.title;
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;
            iframe.style.cssText = `
                width: 100%;
                height: 300px;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            `;

            // Replace placeholder with iframe
            iframe.onload = () => {
                this.element.innerHTML = '';
                this.element.appendChild(iframe);
                this.element.classList.add('youtube-loaded');
            };
        }

        setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Preload video metadata but don't load the iframe yet
                            this.preloadVideo();
                            observer.unobserve(this.element);
                        }
                    });
                }, {
                    rootMargin: '100px 0px',
                    threshold: 0.1
                });

                observer.observe(this.element);
            }
        }

        preloadVideo() {
            // Preload video thumbnail and metadata
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = 'https://www.youtube.com';
            document.head.appendChild(link);

            // Add hover intent detection for faster loading
            let hoverTimer;
            this.element.addEventListener('mouseenter', () => {
                hoverTimer = setTimeout(() => {
                    this.loadVideo();
                }, 300); // Load after 300ms of hovering
            });

            this.element.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
            });
        }
    }

    // Font lazy loading facade
    class FontFacade {
        constructor(element) {
            this.element = element;
            this.fontUrl = element.dataset.fontUrl;
            this.fontFamily = element.dataset.fontFamily;
            this.isLoaded = false;
            
            this.loadFont();
        }

        loadFont() {
            if (this.isLoaded) return;
            
            this.isLoaded = true;
            
            // Create link element for font
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.fontUrl;
            link.onload = () => {
                this.element.classList.add('font-loaded');
                console.log(`Font loaded: ${this.fontFamily}`);
            };
            link.onerror = () => {
                console.warn(`Failed to load font: ${this.fontFamily}`);
            };

            document.head.appendChild(link);
        }
    }

    // Social media link optimization
    class SocialFacade {
        constructor(element) {
            this.element = element;
            this.platform = element.dataset.platform;
            this.url = element.href;
            
            this.optimizeLink();
        }

        optimizeLink() {
            // Add rel="noopener" for security
            this.element.rel = 'noopener noreferrer';
            
            // Add target="_blank" for external links
            this.element.target = '_blank';
            
            // Add loading="lazy" for any images
            const img = this.element.querySelector('img');
            if (img) {
                img.loading = 'lazy';
            }

            // Preconnect to external domains on hover
            let preconnectTimer;
            this.element.addEventListener('mouseenter', () => {
                preconnectTimer = setTimeout(() => {
                    this.preconnectDomain();
                }, 100);
            });

            this.element.addEventListener('mouseleave', () => {
                clearTimeout(preconnectTimer);
            });
        }

        preconnectDomain() {
            const domain = this.getDomainFromUrl(this.url);
            if (domain) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = `https://${domain}`;
                document.head.appendChild(link);
            }
        }

        getDomainFromUrl(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.hostname;
            } catch (e) {
                return null;
            }
        }
    }

    // Initialize lazy loading facades
    function initLazyFacades() {
        // Initialize YouTube facades
        const youtubeElements = document.querySelectorAll(FACADE_CONFIG.youtube.selector);
        youtubeElements.forEach(element => {
            new YouTubeFacade(element);
        });

        // Initialize font facades
        const fontElements = document.querySelectorAll(FACADE_CONFIG.fonts.selector);
        fontElements.forEach(element => {
            new FontFacade(element);
        });

        // Initialize social facades
        const socialElements = document.querySelectorAll(FACADE_CONFIG.social.selector);
        socialElements.forEach(element => {
            new SocialFacade(element);
        });

        console.log('Lazy loading facades initialized');
    }

    // Utility function to convert existing iframes to lazy facades
    function convertIframesToFacades() {
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
        
        iframes.forEach(iframe => {
            const src = iframe.src;
            const videoIdMatch = src.match(/embed\/([^?&]+)/);
            
            if (videoIdMatch) {
                const videoId = videoIdMatch[1];
                const title = iframe.title || 'Video';
                
                // Create facade container
                const facadeContainer = document.createElement('div');
                facadeContainer.className = 'youtube-facade';
                facadeContainer.dataset.videoId = videoId;
                facadeContainer.dataset.title = title;
                
                // Replace iframe with facade
                iframe.parentNode.replaceChild(facadeContainer, iframe);
                
                // Initialize facade
                new YouTubeFacade(facadeContainer);
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLazyFacades();
            convertIframesToFacades();
        });
    } else {
        initLazyFacades();
        convertIframesToFacades();
    }

    // Also run after page load for dynamically added content
    window.addEventListener('load', () => {
        setTimeout(() => {
            initLazyFacades();
        }, 100);
    });

})();
