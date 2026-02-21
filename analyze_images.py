from PIL import Image
import os

files = [
    'public/photo_booth/frame.JPEG',
    'public/photo_booth/left_up.PNG',
    'public/photo_booth/left_down.PNG',
    'public/photo_booth/right_up.PNG',
    'public/photo_booth/right_down.PNG'
]

base_path = r'c:\Users\djcom\.gemini\antigravity\scratch\seungseop-grad'

for f in files:
    full_path = os.path.join(base_path, f)
    if os.path.exists(full_path):
        with Image.open(full_path) as img:
            print(f"{f}: {img.width}x{img.height}")
    else:
        print(f"{f}: Not found")
