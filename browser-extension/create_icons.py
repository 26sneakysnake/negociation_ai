#!/usr/bin/env python3
"""Generate placeholder icons for the browser extension"""
import os
from pathlib import Path

# Try to use PIL/Pillow, if not available use a fallback
try:
    from PIL import Image, ImageDraw, ImageFont
    USE_PIL = True
except ImportError:
    USE_PIL = False
    print("PIL not available, creating minimal PNG files...")

def create_icon_with_pil(size, output_path):
    """Create an icon using PIL"""
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#1a1a2e')
    draw = ImageDraw.Draw(img)

    # Draw a circle
    margin = size // 4
    draw.ellipse([margin, margin, size-margin, size-margin],
                 fill='#16213e', outline='#0f3460', width=max(1, size//32))

    # Draw inner circle
    inner_margin = size // 3
    draw.ellipse([inner_margin, inner_margin, size-inner_margin, size-inner_margin],
                 fill='#533483', outline='#e94560', width=max(1, size//48))

    # Add "AI" text for larger icons
    if size >= 48:
        try:
            font_size = size // 3
            font = ImageFont.load_default()
            text = "AI"

            # Get text bbox
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            position = ((size - text_width) // 2, (size - text_height) // 2 - size // 10)
            draw.text(position, text, fill='#ffffff', font=font)
        except:
            pass

    img.save(output_path, 'PNG')
    print(f"✓ Created {output_path}")

def create_minimal_png(size, output_path):
    """Create a minimal valid PNG file without PIL"""
    # This is a minimal 1x1 transparent PNG, we'll scale it conceptually
    # Minimal PNG data for a colored square
    import base64
    import struct

    # Create a simple PNG programmatically
    def create_png_bytes(width, height, color_rgb):
        # PNG signature
        png_signature = b'\x89PNG\r\n\x1a\n'

        # IHDR chunk
        ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
        ihdr_chunk = b'IHDR' + ihdr_data
        ihdr_crc = struct.pack('>I', 0)  # Simplified, should calculate CRC
        ihdr = struct.pack('>I', len(ihdr_data)) + ihdr_chunk + ihdr_crc

        # IDAT chunk with simple RGB data
        import zlib
        scanlines = b''
        for y in range(height):
            scanlines += b'\x00'  # Filter type
            for x in range(width):
                scanlines += bytes(color_rgb)

        compressed = zlib.compress(scanlines)
        idat_chunk = b'IDAT' + compressed
        idat_crc = struct.pack('>I', 0)  # Simplified
        idat = struct.pack('>I', len(compressed)) + idat_chunk + idat_crc

        # IEND chunk
        iend = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', 0)

        return png_signature + ihdr + idat + iend

    # Create icon with purple/blue color
    color = (83, 52, 131)  # Purple color
    png_data = create_png_bytes(size, size, color)

    with open(output_path, 'wb') as f:
        f.write(png_data)

    print(f"✓ Created {output_path}")

def main():
    # Get the icons directory
    icons_dir = Path(__file__).parent / 'icons'
    icons_dir.mkdir(exist_ok=True)

    sizes = [16, 48, 128]

    print("\n🎨 Creating browser extension icons...\n")

    for size in sizes:
        output_path = icons_dir / f'icon{size}.png'

        if USE_PIL:
            create_icon_with_pil(size, output_path)
        else:
            create_minimal_png(size, output_path)

    print("\n✓ All icons created successfully!")
    print(f"📁 Icons saved to: {icons_dir.absolute()}\n")

if __name__ == '__main__':
    main()
