#!/usr/bin/env python3
"""
Background Image Optimizer
Converts background images to highly compressed formats for faster loading
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps, ImageFilter
except ImportError:
    print("Installing Pillow...")
    os.system("pip install Pillow")
    from PIL import Image, ImageOps, ImageFilter

def optimize_background_image(input_path, output_path, format='JPEG', quality=60, max_width=None):
    """
    Optimize background images for web use
    
    Args:
        input_path (str): Path to input image
        output_path (str): Path to output optimized image
        format (str): Output format (JPEG, PNG, WebP)
        quality (int): Quality for lossy formats (1-100)
        max_width (int): Maximum width for resizing
    """
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create a dark background for transparent images
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background = Image.new('RGB', img.size, (25, 25, 25))  # Dark background
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if specified
            if max_width and img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Apply slight blur to reduce file size (backgrounds don't need sharp detail)
            img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
            
            # Save with optimization
            if format.upper() == 'JPEG':
                img.save(output_path, 'JPEG', quality=quality, optimize=True, progressive=True)
            elif format.upper() == 'WEBP':
                img.save(output_path, 'WebP', quality=quality, optimize=True, method=6)
            else:
                img.save(output_path, format.upper(), optimize=True)
            
            # Get file sizes for comparison
            original_size = os.path.getsize(input_path)
            optimized_size = os.path.getsize(output_path)
            savings = ((original_size - optimized_size) / original_size) * 100
            
            print(f"OK {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
            print(f"  Size: {original_size:,} -> {optimized_size:,} bytes ({savings:.1f}% reduction)")
            
            return True
            
    except Exception as e:
        print(f"ERROR optimizing {input_path}: {e}")
        return False

def main():
    """Optimize all background images"""
    print("Background Image Optimizer")
    print("=" * 40)
    
    # Background images to optimize
    background_images = [
        {
            'input': 'images/bg1.png',
            'output_jpg': 'images/bg1_optimized.jpg',
            'output_webp': 'images/bg1_optimized.webp',
            'max_width': 1920  # Full HD width
        },
        {
            'input': 'images/bg2.png', 
            'output_jpg': 'images/bg2_optimized.jpg',
            'output_webp': 'images/bg2_optimized.webp',
            'max_width': 1920
        },
        {
            'input': 'images/overlay.png',
            'output_jpg': 'images/overlay_optimized.jpg',
            'output_webp': 'images/overlay_optimized.webp',
            'max_width': 512  # Smaller for overlay pattern
        }
    ]
    
    total_savings = 0
    optimized_count = 0
    
    for bg_info in background_images:
        if not os.path.exists(bg_info['input']):
            print(f"WARNING: {bg_info['input']} not found, skipping...")
            continue
            
        print(f"\nOptimizing {bg_info['input']}:")
        print("-" * 30)
        
        # Create JPEG version (best compatibility)
        if optimize_background_image(
            bg_info['input'], 
            bg_info['output_jpg'], 
            format='JPEG', 
            quality=65,  # Lower quality for backgrounds
            max_width=bg_info['max_width']
        ):
            optimized_count += 1
        
        # Create WebP version (best compression)
        if optimize_background_image(
            bg_info['input'], 
            bg_info['output_webp'], 
            format='WebP', 
            quality=70,  # Slightly higher quality for WebP
            max_width=bg_info['max_width']
        ):
            optimized_count += 1
    
    print("\n" + "=" * 40)
    print(f"Background optimization complete!")
    print(f"Images optimized: {optimized_count}")
    print(f"Recommended: Use WebP versions for modern browsers")
    print(f"Fallback: Use JPEG versions for older browsers")

if __name__ == "__main__":
    main()
