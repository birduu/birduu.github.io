#!/usr/bin/env python3
"""
WebP Image Converter for Portfolio Website
Converts all images to WebP format for better performance and load times
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ PIL (Pillow) not installed. Installing...")
    os.system("pip install Pillow")
    from PIL import Image

def convert_to_webp(input_path, output_path, quality=85):
    """Convert an image to WebP format with optimization"""
    try:
        with Image.open(input_path) as img:
            # Handle different image modes
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background for transparent images
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as optimized WebP
            img.save(output_path, 'WebP', quality=quality, optimize=True, method=6)
            
            # Calculate savings
            original_size = os.path.getsize(input_path)
            webp_size = os.path.getsize(output_path)
            savings = ((original_size - webp_size) / original_size) * 100
            
            print(f"OK {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
            print(f"  Size reduction: {savings:.1f}% ({original_size:,} -> {webp_size:,} bytes)")
            
            return True
            
    except Exception as e:
        print(f"ERROR converting {input_path}: {e}")
        return False

def main():
    """Convert all images in the portfolio to WebP"""
    print("WebP Image Converter for Portfolio")
    print("=" * 50)
    
    # Image directories to process
    directories = [
        "images",
        "images/VP/GALLERY",
        "."
    ]
    
    # Supported formats
    formats = {'.png', '.jpg', '.jpeg', '.jfif'}
    
    converted_count = 0
    total_savings = 0
    
    for directory in directories:
        if not os.path.exists(directory):
            continue
            
        print(f"\nProcessing: {directory}")
        print("-" * 30)
        
        for file_path in Path(directory).iterdir():
            if (file_path.is_file() and 
                file_path.suffix.lower() in formats and
                not file_path.name.startswith('.')):
                
                webp_path = file_path.with_suffix('.webp')
                
                # Skip if WebP exists and is newer
                if webp_path.exists() and webp_path.stat().st_mtime > file_path.stat().st_mtime:
                    print(f"SKIP {file_path.name} (WebP up to date)")
                    continue
                
                if convert_to_webp(str(file_path), str(webp_path)):
                    converted_count += 1
    
    print("\n" + "=" * 50)
    print(f"Conversion complete!")
    print(f"Images converted: {converted_count}")
    print(f"Portfolio will now load faster with WebP images!")

if __name__ == "__main__":
    main()
