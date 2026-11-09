import math
import os
from PIL import Image, ImageDraw, ImageFilter

def create_infinity_key_icon(size=512, is_round=False):
    # Master image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.08)
    key_rect = [margin, margin, size - margin, size - margin]
    corner_radius = int(size * 0.5) if is_round else int(size * 0.22)

    # 1. Subtle ambient drop shadow under keycap
    shadow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_img)
    s_offset = int(size * 0.035)
    shadow_rect = [margin, margin + s_offset, size - margin, size - margin + s_offset]
    sdraw.rounded_rectangle(shadow_rect, radius=corner_radius, fill=(0, 0, 0, 160))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(int(size * 0.03)))
    img.alpha_composite(shadow_img)

    # 2. Keycap background with subtle dark purple-to-slate gradient
    key_surf = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    kdraw = ImageDraw.Draw(key_surf)

    # Base keycap fill
    kdraw.rounded_rectangle(key_rect, radius=corner_radius, fill=(20, 24, 34, 255))
    
    # Inner dark purple subtle gradient sheen
    for y in range(key_rect[1], key_rect[3]):
        ratio = (y - key_rect[1]) / float(key_rect[3] - key_rect[1])
        r = int(24 + ratio * 8)
        g = int(20 + ratio * 4)
        b = int(38 + ratio * 12)
        kdraw.line([(key_rect[0], y), (key_rect[2], y)], fill=(r, g, b, 255))

    # Mask keycap to rounded rectangle
    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle(key_rect, radius=corner_radius, fill=255)
    img.paste(key_surf, (0, 0), mask)

    # 3. Key border outline (tactile keyboard keycap border)
    bdraw = ImageDraw.Draw(img)
    border_width = max(3, int(size * 0.022))
    bdraw.rounded_rectangle(key_rect, radius=corner_radius, outline=(65, 75, 98, 255), width=border_width)

    # Inner highlight line at top
    inner_rect = [margin + border_width, margin + border_width, size - margin - border_width, size - margin - border_width]
    bdraw.rounded_rectangle(inner_rect, radius=max(2, corner_radius - border_width), outline=(255, 255, 255, 24), width=max(1, int(size * 0.008)))

    # 4. Generate Infinity Symbol with Blue -> Purple -> Pink Gradient
    # Mathematical lemniscate points
    scale = size * 0.32
    cx, cy = size / 2.0, size / 2.0
    stroke_w = int(size * 0.075)

    inf_surf = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    idraw = ImageDraw.Draw(inf_surf)

    # Sample lemniscate of Bernoulli
    steps = 720
    points = []
    for i in range(steps + 1):
        t = (2.0 * math.pi * i) / steps
        denom = 1.0 + (math.sin(t) ** 2)
        x = cx + (scale * math.sqrt(2) * math.cos(t)) / denom
        y = cy + (scale * math.sqrt(2) * math.sin(t) * math.cos(t)) / denom
        points.append((x, y))

    # Draw continuous segments with gradient interpolation based on X position
    min_x = cx - scale * math.sqrt(2) * 0.95
    max_x = cx + scale * math.sqrt(2) * 0.95

    # Colors: Blue (#38BDF8: 56, 189, 248) -> Purple (#C084FC: 192, 132, 252) -> Pink (#F43F5E: 244, 63, 94)
    def get_color(x_val):
        t = max(0.0, min(1.0, (x_val - min_x) / (max_x - min_x)))
        if t < 0.5:
            local_t = t * 2.0
            r = int(56 + local_t * (192 - 56))
            g = int(189 + local_t * (132 - 189))
            b = int(248 + local_t * (252 - 248))
        else:
            local_t = (t - 0.5) * 2.0
            r = int(192 + local_t * (244 - 192))
            g = int(132 + local_t * (63 - 132))
            b = int(252 + local_t * (94 - 252))
        return (r, g, b, 255)

    # Draw thick round circles along path for smooth anti-aliased gradient
    r_cap = stroke_w / 2.0
    for px, py in points:
        color = get_color(px)
        idraw.ellipse([px - r_cap, py - r_cap, px + r_cap, py + r_cap], fill=color)

    # Add soft neon glow
    glow_surf = inf_surf.filter(ImageFilter.GaussianBlur(int(size * 0.04)))
    glow_draw = ImageDraw.Draw(glow_surf)
    # Blend glow with reduced opacity
    img.alpha_composite(glow_surf)
    img.alpha_composite(inf_surf)

    return img

def main():
    sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }

    base_res = "app/src/main/res"
    os.makedirs(base_res, exist_ok=True)
    os.makedirs("public", exist_ok=True)

    # Master high-res 512
    master_square = create_infinity_key_icon(512, is_round=False)
    master_round = create_infinity_key_icon(512, is_round=True)

    master_square.save("public/icon-512.png")
    master_square.save("public/apple-touch-icon.png")
    master_square.resize((64, 64), Image.Resampling.LANCZOS).save("public/favicon.ico")

    for folder, dim in sizes.items():
        dir_path = os.path.join(base_res, folder)
        os.makedirs(dir_path, exist_ok=True)
        sq = master_square.resize((dim, dim), Image.Resampling.LANCZOS)
        sq.save(os.path.join(dir_path, "ic_launcher.png"))

        rd = master_round.resize((dim, dim), Image.Resampling.LANCZOS)
        rd.save(os.path.join(dir_path, "ic_launcher_round.png"))
        print(f"Generated {folder}: {dim}x{dim}")

    print("All icons successfully generated!")

if __name__ == "__main__":
    main()
