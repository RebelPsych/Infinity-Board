#!/usr/bin/env python3
"""
Generates the Infinity Board Android App Icons and Company Logo.
Matches the exact infinity key pictured in the user's photo:
- Dark tactile keycap (#151821)
- Subtle steel keycap outline border (#2E3546)
- Soft hairline top inner bevel highlight
- Exact solid luminous lilac-purple infinity symbol (#C084FC / #B989F8)
  using DejaVuSans-Bold typeface matching Android's system font glyph.
- Multi-density mipmaps (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Adaptive icon layers (v26) for seamless fit on all Android launchers
- 512x512 Master company logo at public/company-logo.png and public/icon.png
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_PATH = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def render_keycap(size=512, is_round=False):
    ss = 4
    canvas = size * ss
    im = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    
    KEY_BG = (21, 24, 33, 255)         # #151821
    KEY_BORDER = (46, 53, 70, 255)     # #2E3546
    INNER_STROKE = (255, 255, 255, 14) # tactile top bevel highlight
    GLYPH_COLOR = (192, 132, 252, 255) # #C084FC
    GLYPH_GLOW = (192, 132, 252, 35)
    
    border_w = max(1, int(12 * ss * (size / 512.0)))
    pad = int(border_w / 2)
    x0, y0 = pad, pad
    x1, y1 = canvas - pad, canvas - pad
    
    if is_round:
        draw.ellipse([x0, y0, x1, y1], fill=KEY_BG, outline=KEY_BORDER, width=border_w)
        inner_pad = max(1, int(8 * ss * (size / 512.0)))
        draw.ellipse([x0 + inner_pad, y0 + inner_pad, x1 - inner_pad, y1 - inner_pad], outline=INNER_STROKE, width=max(1, int(2 * ss * (size / 512.0))))
        font_size = int(410 * ss * (size / 512.0))
    else:
        corner_r = int(canvas * 0.15)
        draw.rounded_rectangle([x0, y0, x1, y1], radius=corner_r, fill=KEY_BG, outline=KEY_BORDER, width=border_w)
        inner_pad = max(1, int(8 * ss * (size / 512.0)))
        draw.rounded_rectangle([x0 + inner_pad, y0 + inner_pad, x1 - inner_pad, y1 - inner_pad],
                               radius=max(1, corner_r - inner_pad),
                               outline=INNER_STROKE, width=max(1, int(2 * ss * (size / 512.0))))
        font_size = int(430 * ss * (size / 512.0))
        
    font = ImageFont.truetype(FONT_PATH, font_size)
    cx = canvas / 2.0
    cy = canvas / 2.0
    
    # Soft purple glow behind glyph
    glow_im = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_im)
    glow_draw.text((cx, cy), '∞', fill=GLYPH_GLOW, font=font, anchor='mm')
    glow_blur = max(1, int(22 * ss * (size / 512.0)))
    glow_im = glow_im.filter(ImageFilter.GaussianBlur(radius=glow_blur))
    im = Image.alpha_composite(im, glow_im)
    draw = ImageDraw.Draw(im)
    
    # Solid purple infinity glyph
    draw.text((cx, cy), '∞', fill=GLYPH_COLOR, font=font, anchor='mm')
    
    return im.resize((size, size), Image.Resampling.LANCZOS)

def render_adaptive_foreground(size=432):
    """
    Renders the foreground for Android adaptive icons (108dp canvas with 72dp safe zone).
    The glyph is scaled to sit comfortably inside the center 66% safe circle/squircle.
    """
    ss = 4
    canvas = size * ss
    im = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    
    GLYPH_COLOR = (192, 132, 252, 255)
    GLYPH_GLOW = (192, 132, 252, 40)
    
    # The glyph in 108dp canvas should have width ~48dp (which is 44% of 108dp)
    font_size = int(canvas * 0.46)
    font = ImageFont.truetype(FONT_PATH, font_size)
    
    cx = canvas / 2.0
    cy = canvas / 2.0
    
    glow_im = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_im)
    glow_draw.text((cx, cy), '∞', fill=GLYPH_GLOW, font=font, anchor='mm')
    glow_blur = max(1, int(18 * ss * (size / 432.0)))
    glow_im = glow_im.filter(ImageFilter.GaussianBlur(radius=glow_blur))
    im = Image.alpha_composite(im, glow_im)
    draw = ImageDraw.Draw(im)
    
    draw.text((cx, cy), '∞', fill=GLYPH_COLOR, font=font, anchor='mm')
    return im.resize((size, size), Image.Resampling.LANCZOS)

def main():
    densities = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    
    adaptive_densities = {
        'drawable-mdpi': 108,
        'drawable-hdpi': 162,
        'drawable-xhdpi': 216,
        'drawable-xxhdpi': 324,
        'drawable-xxxhdpi': 432,
    }
    
    base_res = 'app/src/main/res'
    
    # Generate mipmaps for all densities
    for folder, size in densities.items():
        dir_path = os.path.join(base_res, folder)
        os.makedirs(dir_path, exist_ok=True)
        
        # Standard keycap launcher icon
        std_icon = render_keycap(size, is_round=False)
        std_icon.save(os.path.join(dir_path, 'ic_launcher.png'))
        
        # Round launcher icon
        rnd_icon = render_keycap(size, is_round=True)
        rnd_icon.save(os.path.join(dir_path, 'ic_launcher_round.png'))
        print(f"Generated {folder}: {size}x{size}")

    # Generate adaptive foreground drawables
    for folder, size in adaptive_densities.items():
        dir_path = os.path.join(base_res, folder)
        os.makedirs(dir_path, exist_ok=True)
        fg_icon = render_adaptive_foreground(size)
        fg_icon.save(os.path.join(dir_path, 'ic_launcher_foreground.png'))
        print(f"Generated adaptive {folder}: {size}x{size}")
        
    # Create adaptive background drawable
    drawable_dir = os.path.join(base_res, 'drawable')
    os.makedirs(drawable_dir, exist_ok=True)
    with open(os.path.join(drawable_dir, 'ic_launcher_background.xml'), 'w') as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#151821" />
</shape>
''')

    # Create mipmap-anydpi-v26 for Android 8.0+ adaptive icons
    anydpi_dir = os.path.join(base_res, 'mipmap-anydpi-v26')
    os.makedirs(anydpi_dir, exist_ok=True)
    
    with open(os.path.join(anydpi_dir, 'ic_launcher.xml'), 'w') as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
''')
        
    with open(os.path.join(anydpi_dir, 'ic_launcher_round.xml'), 'w') as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
''')

    # Master high-res company logo and web icons
    os.makedirs('public/icons', exist_ok=True)
    logo_512 = render_keycap(512, is_round=False)
    logo_512.save('public/company-logo.png')
    logo_512.save('public/icon.png')
    logo_512.save('public/icons/icon-512.png')
    
    logo_192 = render_keycap(192, is_round=False)
    logo_192.save('public/icons/icon-192.png')
    
    print("Generated 512x512 Master Company Logo at public/company-logo.png and public/icon.png")

if __name__ == '__main__':
    main()
