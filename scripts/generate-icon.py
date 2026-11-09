import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def create_infinity_key_icon(size=512, is_round=False):
    # Create RGBA image with 2x supersampling for ultra-crisp edges
    ss = 2
    W = size * ss
    H = size * ss
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx = W // 2
    cy = H // 2

    if is_round:
        # Round icon: circular keycap
        radius = int(W * 0.46)
        # Drop shadow
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sdraw.ellipse([cx - radius + 10, cy - radius + 20, cx + radius - 10, cy + radius + 30], fill=(0, 0, 0, 180))
        shadow = shadow.filter(ImageFilter.GaussianBlur(16 * ss))
        img = Image.alpha_composite(img, shadow)
        draw = ImageDraw.Draw(img)

        # Base keycap fill
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(24, 27, 36, 255), outline=(68, 78, 100, 255), width=int(5 * ss))
        # Inner sheen
        inner_r = radius - int(6 * ss)
        draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], outline=(255, 255, 255, 20), width=int(2 * ss))
    else:
        # Squircle / rounded rectangle keycap
        pad = int(W * 0.06)
        r = int(W * 0.18)
        box = [pad, pad, W - pad, H - pad]

        # Drop shadow
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sdraw.rounded_rectangle([box[0] + 8, box[1] + 16, box[2] - 8, box[3] + 24], radius=r, fill=(0, 0, 0, 160))
        shadow = shadow.filter(ImageFilter.GaussianBlur(14 * ss))
        img = Image.alpha_composite(img, shadow)
        draw = ImageDraw.Draw(img)

        # Draw tactile keycap body
        draw.rounded_rectangle(box, radius=r, fill=(28, 31, 42, 255), outline=(66, 75, 96, 255), width=int(5 * ss))
        # Inner outline within borders
        inner_box = [box[0] + int(6 * ss), box[1] + int(6 * ss), box[2] - int(6 * ss), box[3] - int(6 * ss)]
        draw.rounded_rectangle(inner_box, radius=r - int(4 * ss), outline=(255, 255, 255, 22), width=int(2 * ss))

    # Glow layer for centered infinity symbol
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)

    # Parametric lemniscate (infinity curve)
    # x(t) = a * cos(t) / (1 + sin^2(t))
    # y(t) = a * sin(t) * cos(t) / (1 + sin^2(t))
    scale = W * 0.28
    points = []
    num_steps = 720
    for i in range(num_steps):
        t = (i / num_steps) * 2 * math.pi
        denom = 1 + (math.sin(t) ** 2)
        px = cx + (scale * math.cos(t)) / denom
        py = cy + (scale * math.sin(t) * math.cos(t) * 1.35) / denom
        points.append((px, py, t))

    # Draw soft purple glow behind infinity
    glow_width = int(24 * ss)
    for px, py, t in points:
        gdraw.ellipse([px - glow_width, py - glow_width, px + glow_width, py + glow_width], fill=(192, 132, 252, 18))
    glow = glow.filter(ImageFilter.GaussianBlur(10 * ss))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # Draw centered infinity curve with signature gradient:
    # Left: Sky Blue (#38BDF8), Center: Purple (#C084FC), Right: Pink/Magenta (#F43F5E)
    stroke_radius = int(14 * ss)
    for px, py, t in points:
        # Normalized x position across infinity loop [-1, 1]
        norm_x = (px - cx) / scale  # roughly -1.0 to 1.0

        if norm_x < -0.15:
            # Left side: Sky Blue (#38BDF8) blending into Purple (#C084FC)
            f = (norm_x + 1.0) / 0.85
            f = max(0.0, min(1.0, f))
            r_c = int(56 + f * (192 - 56))
            g_c = int(189 + f * (132 - 189))
            b_c = int(248 + f * (252 - 248))
        else:
            # Right side: Purple (#C084FC) blending into Pink/Magenta (#F43F5E)
            f = (norm_x + 0.15) / 1.15
            f = max(0.0, min(1.0, f))
            r_c = int(192 + f * (244 - 192))
            g_c = int(132 + f * (63 - 132))
            b_c = int(252 + f * (94 - 252))

        draw.ellipse([px - stroke_radius, py - stroke_radius, px + stroke_radius, py + stroke_radius], fill=(r_c, g_c, b_c, 255))

    # Inner core highlight line for 3D metallic neon pop
    core_radius = int(5 * ss)
    for px, py, t in points:
        draw.ellipse([px - core_radius, py - core_radius, px + core_radius, py + core_radius], fill=(255, 255, 255, 80))

    # Downscale from 2x supersampling to target size
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    return img

def main():
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    base_res = "app/src/main/res"
    for folder, size in densities.items():
        target_dir = os.path.join(base_res, folder)
        os.makedirs(target_dir, exist_ok=True)

        # Standard icon
        icon = create_infinity_key_icon(size, is_round=False)
        icon.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")

        # Round icon
        round_icon = create_infinity_key_icon(size, is_round=True)
        round_icon.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
        print(f"Generated {folder}: {size}x{size}")

    # Also save 512x512 high-res store icon
    os.makedirs("public/icons", exist_ok=True)
    icon_512 = create_infinity_key_icon(512, is_round=False)
    icon_512.save("public/icons/icon-512.png", "PNG")
    icon_512.save("public/icon.png", "PNG")
    print("Generated 512x512 icon at public/icons/icon-512.png")

if __name__ == "__main__":
    main()
