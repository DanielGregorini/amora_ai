"""Organizes the raw dataset in place.

For every image inside raw_dataset/<class>/:
- renames it to a clean sequential name: amora_1.jpg, not_amora_1.jpg, ...
- converts any format (HEIC, PNG, WEBP, JPEG...) to JPG
- optionally shrinks it to fit MAX_SIZE, keeping the aspect ratio

Run this BEFORE preprocess_images.py.
"""
import os

from PIL import Image

try:
    # HEIC/HEIF support (iPhone photos). Install with: pip3 install pillow-heif
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False

INPUT_DIR = "raw_dataset"

CLASSES = ["amora", "not_amora"]

# Maximum size of the longest image side, in pixels.
# Example: 1200 -> a 4000x3000 photo becomes 1200x900 (proportion kept).
# Use None to keep every image at its original size.
MAX_SIZE = 1500

# JPEG quality used when a file needs converting or resizing (0-100).
# 95 is visually lossless; already-good JPGs are renamed without re-encoding.
JPEG_QUALITY = 95

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif")


def needs_resize(img):
    return MAX_SIZE is not None and (img.width > MAX_SIZE or img.height > MAX_SIZE)


def organize_class(class_dir, cls):
    files = sorted(
        f for f in os.listdir(class_dir)
        if os.path.isfile(os.path.join(class_dir, f)) and not f.startswith(".")
    )

    images = [f for f in files if f.lower().endswith(VALID_EXTENSIONS)]
    skipped = [f for f in files if f not in images]

    if not HEIC_SUPPORT and any(f.lower().endswith((".heic", ".heif")) for f in images):
        images = [f for f in images if not f.lower().endswith((".heic", ".heif"))]
        print("HEIC files found but pillow-heif is not installed.")
        print("Install it with: pip3 install pillow-heif")

    # phase 1: move everything to temporary names, so a file that is
    # already called amora_1.jpg cannot collide with the new numbering
    temp_names = []
    for i, filename in enumerate(images):
        ext = os.path.splitext(filename)[1].lower()
        temp = f"__tmp_{i}{ext}"
        os.rename(os.path.join(class_dir, filename), os.path.join(class_dir, temp))
        temp_names.append(temp)

    # phase 2: final sequential names, converting/resizing when needed
    converted = 0
    resized = 0
    for i, temp in enumerate(temp_names, start=1):
        temp_path = os.path.join(class_dir, temp)
        ext = os.path.splitext(temp)[1]
        final_path = os.path.join(class_dir, f"{cls}_{i}.jpg")

        is_jpg = ext in (".jpg", ".jpeg")

        if is_jpg and MAX_SIZE is None:
            # plain rename, no re-encoding, zero quality loss
            os.rename(temp_path, final_path)
            continue

        with Image.open(temp_path) as img:
            if is_jpg and not needs_resize(img):
                # already a JPG within the size limit: rename only
                os.rename(temp_path, final_path)
                continue

            img = img.convert("RGB")
            if needs_resize(img):
                img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
                resized += 1
            if not is_jpg:
                converted += 1
            img.save(final_path, "JPEG", quality=JPEG_QUALITY, optimize=True)

        os.remove(temp_path)

    print(f"{cls}: {len(temp_names)} images -> {cls}_1.jpg..{cls}_{len(temp_names)}.jpg "
          f"({converted} converted to JPG, {resized} resized)")
    for f in skipped:
        print(f"  skipped (unsupported format): {f}")


def organize(input_dir=INPUT_DIR):
    for cls in CLASSES:
        class_dir = os.path.join(input_dir, cls)
        if not os.path.isdir(class_dir):
            print(f"Missing folder: {class_dir}")
            continue
        organize_class(class_dir, cls)

    print("Organizing completed")


if __name__ == "__main__":
    organize()
