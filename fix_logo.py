from PIL import Image
import os

src = os.path.join('frontend', 'images', 'BU logo.jpg')
dst = os.path.join('frontend', 'images', 'bugema-logo.png')

if not os.path.exists(src):
    raise FileNotFoundError(f"Source logo not found: {src}")

img = Image.open(src)
img.save(dst)
print(f"Replaced bugema-logo.png with BU logo from {src}")
