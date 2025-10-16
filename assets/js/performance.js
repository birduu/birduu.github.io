/**
 * Performance Monitoring and Optimization
 * Tracks loading performance and implements additional optimizations
 */

(function() {
    'use strict';

    // Performance metrics
    let performanceData = {
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0
    };

    // Initialize performance monitoring
    function initPerformanceMonitoring() {
        // Track page load time
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            performanceData.loadTime = loadTime;
            
            console.log('Page load time:', Math.round(loadTime), 'ms');
            
            // Send performance data to analytics (if implemented)
            sendPerformanceData();
        });

        // Track DOM content loaded
        document.addEventListener('DOMContentLoaded', function() {
            const domTime = performance.now();
            performanceData.domContentLoaded = domTime;
            console.log('DOM Content Loaded:', Math.round(domTime), 'ms');
        });

        // Track Core Web Vitals
        trackCoreWebVitals();
        
        // Register service worker
        registerServiceWorker();
    }

    // Track Core Web Vitals
    function trackCoreWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    performanceData.largestContentfulPaint = lastEntry.startTime;
                    console.log('LCP:', Math.round(lastEntry.startTime), 'ms');
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.log('LCP not supported');
            }

            // Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    performanceData.cumulativeLayoutShift = clsValue;
                    console.log('CLS:', clsValue.toFixed(4));
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.log('CLS not supported');
            }
        }
    }

    // Register service worker
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('Service Worker registered successfully:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', function() {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, refresh the page
                                    if (confirm('New version available! Refresh to update?')) {
                                        window.location.reload();
                                    }
                                }
                            });
                        });
                    })
                    .catch(function(error) {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }
    }

    // Optimize image loading
    function optimizeImageLoading() {
        // Add loading="lazy" to images that don't have it
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
        });

        // Preload critical images
        const criticalImages = [
            'images/jhill.png',
            'images/statue.png',
            'images/arch.png'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Optimize font loading
    function optimizeFontLoading() {
        // Add font-display: swap for better performance
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Source Sans Pro';
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    // Implement intersection observer for lazy loading
    function initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Load the image
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // Add loaded class
                        img.classList.add('loaded');
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            // Observe all images with data-src
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Send performance data
    function sendPerformanceData() {
        // Here you could send data to analytics
        console.log('Performance Data:', performanceData);
        
        // Store in localStorage for debugging
        localStorage.setItem('portfolio_performance', JSON.stringify(performanceData));
    }

    // Optimize scroll performance
    function optimizeScrollPerformance() {
        let ticking = false;
        
        function updateScroll() {
            // Throttled scroll handling
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Initialize all optimizations
    function init() {
        optimizeImageLoading();
        optimizeFontLoading();
        initIntersectionObserver();
        optimizeScrollPerformance();
        
        console.log('Performance optimizations initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Initialize performance monitoring
    initPerformanceMonitoring();

})();
