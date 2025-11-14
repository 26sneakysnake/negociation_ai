#!/usr/bin/env python3
"""Quick script to create browser extension icons"""
import base64
from pathlib import Path

# Minimal PNG files in base64 (valid PNG format)
# These are solid color squares - good enough for a hackathon!

# 16x16 purple icon
ICON_16 = '''
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEElEQVR42mP8z8DwHwyHBoAEAEEa
Ax1FyDaBAAAAAElFTkSuQmCC
'''.strip().replace('\n', '')

# 48x48 purple icon
ICON_48 = '''
iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAEElEQVR42mP8z8DwHwyHBgAE
BgMdRcTpZgAAAABJRU5ErkJggg==
'''.strip().replace('\n', '')

# 128x128 purple icon
ICON_128 = '''
iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAEElEQVR42mP8z8DwHwyHBgAE
CQMdRQ7xAwAAAABJRU5ErkJggg==
'''.strip().replace('\n', '')

def create_icons():
    icons_dir = Path('browser-extension/icons')
    icons_dir.mkdir(parents=True, exist_ok=True)

    print("\n🎨 Creating extension icons...\n")

    # Create 16x16
    with open(icons_dir / 'icon16.png', 'wb') as f:
        f.write(base64.b64decode(ICON_16))
    print("✓ Created icon16.png")

    # Create 48x48
    with open(icons_dir / 'icon48.png', 'wb') as f:
        f.write(base64.b64decode(ICON_48))
    print("✓ Created icon48.png")

    # Create 128x128
    with open(icons_dir / 'icon128.png', 'wb') as f:
        f.write(base64.b64decode(ICON_128))
    print("✓ Created icon128.png")

    print("\n✅ All icons created successfully!")
    print(f"📁 Location: {icons_dir.absolute()}\n")

if __name__ == '__main__':
    create_icons()
