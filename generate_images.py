#!/usr/bin/env python3
"""Generate high-quality images for the Scholarship and Bursaries Portal"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Create images directory if it doesn't exist
images_dir = "frontend/images"
os.makedirs(images_dir, exist_ok=True)

def create_gradient(img, color1, color2):
    """Create a gradient background"""
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    for y in range(height):
        # Linear gradient
        ratio = y / height
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

def create_professional_image(filename, width, height, color1, color2, title, subtitle):
    """Create professional slider image with gradient and text"""
    img = Image.new('RGB', (width, height), color1)
    create_gradient(img, color1, color2)
    
    # Add a subtle pattern overlay
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    
    # Draw subtle geometric shapes
    for i in range(0, width, 100):
        for j in range(0, height, 100):
            draw_overlay.ellipse(
                [(i, j), (i+50, j+50)],
                fill=(255, 255, 255, 5)
            )
    
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)
    
    # Add darker overlay for text readability
    overlay2 = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw_overlay2 = ImageDraw.Draw(overlay2)
    draw_overlay2.rectangle([(0, height//3), (width, height)], fill=(0, 0, 0, 180))
    img = Image.alpha_composite(img.convert('RGBA'), overlay2).convert('RGB')
    
    # Draw text
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 28)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Title
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 60
    
    draw.text((title_x, title_y), title, fill=(255, 255, 255), font=title_font)
    
    # Subtitle
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = height // 2 + 30
    
    draw.text((subtitle_x, subtitle_y), subtitle, fill=(255, 215, 0), font=subtitle_font)
    
    filepath = os.path.join(images_dir, filename)
    img.save(filepath)
    print(f"✓ Created: {filepath}")

# Create professional BUGEMA Logo
def create_logo():
    img = Image.new('RGB', (300, 300), (0, 51, 102))
    create_gradient(img, (0, 51, 102), (20, 80, 140))
    
    draw = ImageDraw.Draw(img)
    
    try:
        font_large = ImageFont.truetype("arial.ttf", 32)
        font_small = ImageFont.truetype("arial.ttf", 18)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw circle border
    draw.ellipse([(20, 20), (280, 280)], outline=(255, 215, 0), width=3)
    
    # Draw text
    title_text = "BUGEMA"
    subtitle_text = "UNIVERSITY"
    
    title_bbox = draw.textbbox((0, 0), title_text, font=font_large)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (300 - title_width) // 2
    title_y = 110
    
    draw.text((title_x, title_y), title_text, fill=(255, 215, 0), font=font_large)
    
    subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=font_small)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (300 - subtitle_width) // 2
    subtitle_y = 160
    
    draw.text((subtitle_x, subtitle_y), subtitle_text, fill=(255, 255, 255), font=font_small)
    
    filepath = os.path.join(images_dir, "bugema-logo.png")
    img.save(filepath)
    print(f"✓ Created: {filepath}")

# Create professional slider images
create_logo()

create_professional_image(
    "scholarship-1.jpg",
    1200, 400,
    (52, 152, 219),  # Light blue
    (30, 100, 180),  # Dark blue
    "Scholarship Issuing",
    "Practical support in action"
)

create_professional_image(
    "bursary-1.jpg",
    1200, 400,
    (46, 204, 113),  # Light green
    (20, 150, 80),   # Dark green
    "Bursary Issuing",
    "Funds disbursed to eligible students"
)

create_professional_image(
    "partner-1.jpg",
    1200, 400,
    (155, 89, 182),  # Light purple
    (100, 40, 150),  # Dark purple
    "Partner Disbursement",
    "Funding delivered through trusted partners"
)

create_professional_image(
    "sports-1.jpg",
    1200, 400,
    (230, 126, 34),  # Light orange
    (180, 70, 10),   # Dark orange
    "Sports & Activity Grants",
    "Practical athlete and club support"
)

create_professional_image(
    "community-1.jpg",
    1200, 400,
    (231, 76, 60),   # Light red
    (180, 30, 20),   # Dark red
    "Community Service Awards",
    "Verified student impact recognition"
)

print("\n✓ All professional images generated successfully!")
print("✓ Images are optimized and ready to display!")
