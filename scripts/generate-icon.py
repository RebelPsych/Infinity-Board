import os
import math
from PIL import Image, ImageDraw, ImageFilter

def draw_solid_infinity(draw, cx, cy, width, stroke_width, color):
    """
    Draw a solid, thick, beautifully proportioned infinity symbol matching the photo.
    """
    num_steps = 1800
    points = []
    scale = width * 0.46
    
    # Parametric lemniscate formula with circular-loop aspect
    for i in range(num_steps):
        t = (i / num_steps) * 2 * math.pi
        denom = 1.0 + (math.sin(t) ** 2)
        px = cx + (scale * math.cos(t)) / denom
        py = cy + (scale * math.sin(t) * math.cos(t) * 1.34) / denom
        points.append((px, py))
        
    half_stroke = stroke_width / 2.0
    for px, py in points:
        draw.ellipse([px - half_stroke, py - half_stroke, px + half_stroke, py + half_stroke], fill=color)

def generate_logo_icon(size=512, is_round=False):
    # 2x supersampling for high-end corporate vector-like crispness
    ss = 2
    S = size * ss
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    
    cx = S / 2.0
    cy = S / 2.0
    
    # Dimensions: showing the whole key clearly with comfortable margins
    key_w = S * 0.82
    key_h = S * 0.82
    corner_r = S * 0.17
    
    left = cx - key_w / 2.0
    top = cy - key_h / 2.0
    right = cx + key_w / 2.0
    bottom = cy + key_h / 2.0
    
    # 1. Subtle dark background canvas so key stands out cleanly
    if is_round:
        draw_base = ImageDraw.Draw(img)
        draw_base.ellipse([S * 0.015, S * 0.015, S * 0.985, S * 0.985], fill=(9, 11, 15, 255))
    else:
        draw_base = ImageDraw.Draw(img)
        draw_base.rounded_rectangle([S * 0.015, S * 0.015, S * 0.985, S * 0.985], radius=int(S * 0.22), fill=(9, 11, 15, 255))

    # 2. Keycap Drop Shadow (soft 3D tactile elevation)
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([left + 2 * ss, top + 10 * ss, right - 2 * ss, bottom + 18 * ss], radius=int(corner_r), fill=(0, 0, 0, 220))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12 * ss))
    img = Image.alpha_composite(img, shadow)

    # 3. Tactile Keycap Body
    key_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    kdraw = ImageDraw.Draw(key_layer)
    
    # Deep dark slate keycap surface matching photo (#181B26)
    kdraw.rounded_rectangle([left, top, right, bottom], radius=int(corner_r), fill=(24, 27, 38, 255))
    
    # Outer keycap outline border (#3E485E) matching keyboard physical keys
    border_width = int(4.5 * ss)
    kdraw.rounded_rectangle([left, top, right, bottom], radius=int(corner_r), outline=(62, 72, 94, 255), width=border_width)
    
    # Inner bevel highlight outline within borders
    inner_pad = int(4.5 * ss)
    kdraw.rounded_rectangle(
        [left + inner_pad, top + inner_pad, right - inner_pad, bottom - inner_pad],
        radius=int(corner_r - 2.5 * ss),
        outline=(255, 255, 255, 18),
        width=int(1.5 * ss)
    )
    
    # Subtle top keycap surface sheen
    kdraw.line([left + corner_r, top + inner_pad + int(1 * ss), right - corner_r, top + inner_pad + int(1 * ss)], fill=(255, 255, 255, 36), width=int(2 * ss))
    
    img = Image.alpha_composite(img, key_layer)

    # 4. Soft purple ambient glow aura behind the infinity symbol
    glow_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow_layer)
    # Luminous violet glow
    draw_solid_infinity(gdraw, cx, cy, width=key_w * 0.65, stroke_width=int(38 * ss), color=(184, 137, 248, 60))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(14 * ss))
    img = Image.alpha_composite(img, glow_layer)

    # 5. Bold, solid purple infinity symbol matching the photo (#B888F8)
    sym_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sym_draw = ImageDraw.Draw(sym_layer)
    
    # Exact solid purple color sampled from user photo
    solid_purple = (185, 137, 248, 255) # #B989F8
    draw_solid_infinity(sym_draw, cx, cy, width=key_w * 0.64, stroke_width=int(32 * ss), color=solid_purple)
    
    img = Image.alpha_composite(img, sym_layer)

    # Downsample to target size with Lanczos filter for pristine edges
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    base_res = "app/src/main/res"
    for folder, sz in densities.items():
        tdir = os.path.join(base_res, folder)
        os.makedirs(tdir, exist_ok=True)
        
        sq = generate_logo_icon(sz, is_round=False)
        sq.save(os.path.join(tdir, "ic_launcher.png"), "PNG")
        
        rd = generate_logo_icon(sz, is_round=True)
        rd.save(os.path.join(tdir, "ic_launcher_round.png"), "PNG")
        print(f"Generated {folder}: {sz}x{sz}")
        
    os.makedirs("public/icons", exist_ok=True)
    icon_512 = generate_logo_icon(512, is_round=False)
    icon_512.save("public/icons/icon-512.png", "PNG")
    icon_512.save("public/icon.png", "PNG")
    icon_512.save("public/company-logo.png", "PNG")
    print("Generated 512x512 company logo icon at public/icons/icon-512.png and public/company-logo.png")

if __name__ == "__main__":
    main()
