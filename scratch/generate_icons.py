import os
import json
import shutil
import zipfile
from PIL import Image, ImageDraw

base_export = r'c:\Users\rizky\Documents\Dev\Recuiter-Industrial\app-icons-export'
frontend_public = r'c:\Users\rizky\Documents\Dev\Recuiter-Industrial\frontend\public'
frontend_icons = os.path.join(frontend_public, 'icons')

os.makedirs(base_export, exist_ok=True)
os.makedirs(frontend_icons, exist_ok=True)

# 1. Load the 1024x1024 master
master = Image.open(r'c:\Users\rizky\Documents\Dev\Recuiter-Industrial\scratch\master_1024_grad.png').convert('RGB')
master_rgba = master.convert('RGBA')

# Round mask helper for Android round icons
def make_round(img):
    w, h = img.size
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, w, h), fill=255)
    rounded = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    rounded.paste(img.convert('RGBA'), (0, 0), mask)
    return rounded

# --- PWA Web Icons ---
pwa_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for size in pwa_sizes:
    resized = master.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(os.path.join(frontend_icons, f'icon-{size}x{size}.png'), 'PNG')
    
    # Save maskable with 78% safe area diameter
    maskable_canvas = Image.new('RGB', (size, size), (250, 251, 253))
    inner_size = int(size * 0.78)
    inner_img = master.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    offset = (size - inner_size) // 2
    maskable_canvas.paste(inner_img, (offset, offset))
    maskable_canvas.save(os.path.join(frontend_icons, f'icon-maskable-{size}x{size}.png'), 'PNG')

# Apple Touch Icon & Favicon
apple_touch = master.resize((180, 180), Image.Resampling.LANCZOS)
apple_touch.save(os.path.join(frontend_public, 'apple-touch-icon.png'), 'PNG')

fav32 = master.resize((32, 32), Image.Resampling.LANCZOS)
fav32.save(os.path.join(frontend_public, 'favicon.png'), 'PNG')
master.save(os.path.join(frontend_public, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

print('PWA web icons generated successfully!')

# --- iOS IPA AppIcon.appiconset ---
ios_dir = os.path.join(base_export, 'ios', 'AppIcon.appiconset')
os.makedirs(ios_dir, exist_ok=True)

ios_specs = [
    {'size': '20x20', 'idiom': 'iphone', 'scale': '2x', 'px': 40, 'filename': 'AppIcon-20@2x.png'},
    {'size': '20x20', 'idiom': 'iphone', 'scale': '3x', 'px': 60, 'filename': 'AppIcon-20@3x.png'},
    {'size': '29x29', 'idiom': 'iphone', 'scale': '1x', 'px': 29, 'filename': 'AppIcon-29.png'},
    {'size': '29x29', 'idiom': 'iphone', 'scale': '2x', 'px': 58, 'filename': 'AppIcon-29@2x.png'},
    {'size': '29x29', 'idiom': 'iphone', 'scale': '3x', 'px': 87, 'filename': 'AppIcon-29@3x.png'},
    {'size': '40x40', 'idiom': 'iphone', 'scale': '2x', 'px': 80, 'filename': 'AppIcon-40@2x.png'},
    {'size': '40x40', 'idiom': 'iphone', 'scale': '3x', 'px': 120, 'filename': 'AppIcon-40@3x.png'},
    {'size': '60x60', 'idiom': 'iphone', 'scale': '2x', 'px': 120, 'filename': 'AppIcon-60@2x.png'},
    {'size': '60x60', 'idiom': 'iphone', 'scale': '3x', 'px': 180, 'filename': 'AppIcon-60@3x.png'},
    {'size': '20x20', 'idiom': 'ipad', 'scale': '1x', 'px': 20, 'filename': 'AppIcon-20~ipad.png'},
    {'size': '20x20', 'idiom': 'ipad', 'scale': '2x', 'px': 40, 'filename': 'AppIcon-20@2x~ipad.png'},
    {'size': '29x29', 'idiom': 'ipad', 'scale': '1x', 'px': 29, 'filename': 'AppIcon-29~ipad.png'},
    {'size': '29x29', 'idiom': 'ipad', 'scale': '2x', 'px': 58, 'filename': 'AppIcon-29@2x~ipad.png'},
    {'size': '40x40', 'idiom': 'ipad', 'scale': '1x', 'px': 40, 'filename': 'AppIcon-40~ipad.png'},
    {'size': '40x40', 'idiom': 'ipad', 'scale': '2x', 'px': 80, 'filename': 'AppIcon-40@2x~ipad.png'},
    {'size': '76x76', 'idiom': 'ipad', 'scale': '1x', 'px': 76, 'filename': 'AppIcon-76.png'},
    {'size': '76x76', 'idiom': 'ipad', 'scale': '2x', 'px': 152, 'filename': 'AppIcon-76@2x.png'},
    {'size': '83.5x83.5', 'idiom': 'ipad', 'scale': '2x', 'px': 167, 'filename': 'AppIcon-83.5@2x.png'},
    {'size': '1024x1024', 'idiom': 'ios-marketing', 'scale': '1x', 'px': 1024, 'filename': 'AppIcon-1024.png'}
]

images_json = []
for spec in ios_specs:
    fn = spec['filename']
    px = spec['px']
    res = master.resize((px, px), Image.Resampling.LANCZOS)
    res.save(os.path.join(ios_dir, fn), 'PNG')
    images_json.append({
        'size': spec['size'],
        'idiom': spec['idiom'],
        'filename': fn,
        'scale': spec['scale']
    })

contents_json = {
    'images': images_json,
    'info': {
        'version': 1,
        'author': 'xcode'
    }
}

with open(os.path.join(ios_dir, 'Contents.json'), 'w', encoding='utf-8') as f:
    json.dump(contents_json, f, indent=2)

print('iOS AppIcon.appiconset generated!')

# --- Android APK Asset Pack ---
android_dir = os.path.join(base_export, 'android')
res_dir = os.path.join(android_dir, 'res')

android_densities = [
    ('mipmap-mdpi', 48),
    ('mipmap-hdpi', 72),
    ('mipmap-xhdpi', 96),
    ('mipmap-xxhdpi', 144),
    ('mipmap-xxxhdpi', 192)
]

for folder, px in android_densities:
    fdir = os.path.join(res_dir, folder)
    os.makedirs(fdir, exist_ok=True)
    # Square / standard icon
    res = master.resize((px, px), Image.Resampling.LANCZOS)
    res.save(os.path.join(fdir, 'ic_launcher.png'), 'PNG')
    # Round icon
    rnd = make_round(res)
    rnd.save(os.path.join(fdir, 'ic_launcher_round.png'), 'PNG')

# Google Play Store 512x512
play_icon = master.resize((512, 512), Image.Resampling.LANCZOS)
play_icon.save(os.path.join(android_dir, 'ic_launcher-playstore.png'), 'PNG')

# Adaptive icon foreground (432x432 for xxxhdpi)
extracted = Image.open(r'c:\Users\rizky\Documents\Dev\Recuiter-Industrial\scratch\extracted_logo.png')
logo_crop = extracted.crop((280, 115, 744, 465))
cw, ch = logo_crop.size

fg_canvas = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
fg_w = int(432 * 0.68)
fg_h = int(ch * (fg_w / cw))
fg_resized = logo_crop.resize((fg_w, fg_h), Image.Resampling.LANCZOS)
fg_canvas.paste(fg_resized, ((432 - fg_w) // 2, (432 - fg_h) // 2), fg_resized)

anydpi_dir = os.path.join(res_dir, 'mipmap-anydpi-v26')
os.makedirs(anydpi_dir, exist_ok=True)
drawable_dir = os.path.join(res_dir, 'drawable')
os.makedirs(drawable_dir, exist_ok=True)

# Foreground PNG in xxxhdpi
xxxhdpi_dir = os.path.join(res_dir, 'mipmap-xxxhdpi')
fg_canvas.save(os.path.join(xxxhdpi_dir, 'ic_launcher_foreground.png'), 'PNG')

# Adaptive icon XMLs
ic_launcher_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""

with open(os.path.join(anydpi_dir, 'ic_launcher.xml'), 'w', encoding='utf-8') as f:
    f.write(ic_launcher_xml)

with open(os.path.join(anydpi_dir, 'ic_launcher_round.xml'), 'w', encoding='utf-8') as f:
    f.write(ic_launcher_xml)

# Color XML for background
values_dir = os.path.join(res_dir, 'values')
os.makedirs(values_dir, exist_ok=True)
ic_launcher_background_xml = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
"""

with open(os.path.join(values_dir, 'ic_launcher_background.xml'), 'w', encoding='utf-8') as f:
    f.write(ic_launcher_background_xml)

# Master 1024 high-res copies and previews
master.save(os.path.join(base_export, 'master-1024x1024.png'), 'PNG')
shutil.copyfile(r'c:\Users\rizky\Documents\Dev\Recuiter-Industrial\scratch\preview_ios_squircle.png', os.path.join(base_export, 'preview_ios_squircle.png'))
shutil.copyfile(r'c:\Users\rizky\Documents\Dev\Recuiter-Industrial\scratch\preview_android_circle.png', os.path.join(base_export, 'preview_android_circle.png'))

# Create ZIP file for easy distribution
zip_path = os.path.join(r'c:\Users\rizky\Documents\Dev\Recuiter-Industrial', 'mobile-app-icons.zip')
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(base_export):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, os.path.dirname(base_export))
            zipf.write(full_path, rel_path)

print(f'Done! ZIP archive created at {zip_path}')
