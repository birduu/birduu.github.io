/**
 * Responsive Images Enhancement
 * Automatically converts existing images to responsive images with srcset
 */

(function() {
    'use strict';

    // Responsive breakpoints
    const breakpoints = [
        { suffix: 'small', width: 400 },
        { suffix: 'medium', width: 600 },
        { suffix: 'large', width: 800 },
        { suffix: 'xlarge', width: 1200 },
        { suffix: 'xxlarge', width: 1600 }
    ];

    // Generate srcset string for an image
    function generateSrcset(basePath, extension, format = 'png') {
        return breakpoints.map(bp => {
            const responsivePath = basePath.replace(`.${extension}`, `_${bp.suffix}.${extension}`);
            return `${responsivePath} ${bp.width}w`;
        }).join(', ');
    }

    // Generate sizes attribute based on container
    function generateSizes(containerClass) {
        if (containerClass.includes('gallery')) {
            return '(max-width: 600px) 400px, (max-width: 900px) 600px, (max-width: 1200px) 800px, 1200px';
        } else if (containerClass.includes('3d') || containerClass.includes('main')) {
            return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        }
        return '100vw';
    }

    // Convert image to responsive
    function makeImageResponsive(img, containerClass = '') {
        const src = img.src || img.getAttribute('src');
        if (!src) return;

        // Extract base path and extension
        const pathMatch = src.match(/^(.+?)(\.[^.]+)$/);
        if (!pathMatch) return;

        const basePath = pathMatch[1];
        const extension = pathMatch[2].substring(1); // Remove the dot

        // Generate responsive srcset
        const srcset = generateSrcset(basePath, extension);
        const sizes = generateSizes(containerClass);

        // Set attributes
        img.setAttribute('srcset', srcset);
        img.setAttribute('sizes', sizes);
        img.setAttribute('loading', 'lazy');

        // Add responsive class for styling
        img.classList.add('responsive-image');
    }

    // Convert picture elements to responsive
    function makePictureResponsive(picture, containerClass = '') {
        const img = picture.querySelector('img');
        const source = picture.querySelector('source');

        if (!img) return;

        const src = img.src || img.getAttribute('src');
        if (!src) return;

        // Extract base path and extension
        const pathMatch = src.match(/^(.+?)(\.[^.]+)$/);
        if (!pathMatch) return;

        const basePath = pathMatch[1];
        const extension = pathMatch[2].substring(1);

        // Generate responsive srcset for both WebP and fallback
        const webpSrcset = generateSrcset(basePath, extension);
        const pngSrcset = generateSrcset(basePath, extension);
        const sizes = generateSizes(containerClass);

        // Update source element (WebP)
        if (source) {
            source.setAttribute('srcset', webpSrcset);
            source.setAttribute('sizes', sizes);
        }

        // Update img element (fallback)
        img.setAttribute('srcset', pngSrcset);
        img.setAttribute('sizes', sizes);
        img.setAttribute('loading', 'lazy');

        // Add responsive class
        picture.classList.add('responsive-picture');
    }

    // Initialize responsive images
    function initResponsiveImages() {
        // Process gallery images
        const galleryPictures = document.querySelectorAll('#GameCaptureScreenshot picture');
        galleryPictures.forEach(picture => {
            makePictureResponsive(picture, 'gallery');
        });

        // Process 3D work images
        const workPictures = document.querySelectorAll('#3D picture');
        workPictures.forEach(picture => {
            makePictureResponsive(picture, '3d');
        });

        // Process any remaining images
        const remainingImages = document.querySelectorAll('img:not([srcset])');
        remainingImages.forEach(img => {
            const container = img.closest('article, section, div');
            const containerClass = container ? container.className : '';
            makeImageResponsive(img, containerClass);
        });

        console.log('Responsive images initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResponsiveImages);
    } else {
        initResponsiveImages();
    }

    // Also run after page load for dynamically added content
    window.addEventListener('load', function() {
        setTimeout(initResponsiveImages, 100);
    });

})();
