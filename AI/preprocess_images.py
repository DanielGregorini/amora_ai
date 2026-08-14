from PIL import Image
import os
import shutil


INPUT_DIR = "raw_dataset"
OUTPUT_DIR = "dataset"

IMAGE_SIZE = (224, 224)
JPEG_QUALITY = 90

CLASSES = ["amora", "not_amora"]

def process_image(input_path, output_path):
    """Resize, strip all metadata and save image"""
    try:
        with Image.open(input_path) as img:
            img = img.convert("RGB")
            img = img.resize(IMAGE_SIZE, Image.LANCZOS)

            # Rebuild the image from raw pixels only, so no metadata
            # (EXIF, GPS, ICC profile, comments) survives into the output
            clean = Image.frombytes(img.mode, img.size, img.tobytes())

            clean.save(output_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
    except Exception as e:
        print(f"Error processing {input_path}: {e}")


def process_dataset(input_dir=INPUT_DIR, output_dir=OUTPUT_DIR):
    """Process entire dataset"""

    # Remove output folder if it exists
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

    os.makedirs(output_dir, exist_ok=True)

    for cls in CLASSES:
        input_class_dir = os.path.join(input_dir, cls)
        output_class_dir = os.path.join(output_dir, cls)

        os.makedirs(output_class_dir, exist_ok=True)

        count = 0

        for filename in sorted(os.listdir(input_class_dir)):
            if filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                input_path = os.path.join(input_class_dir, filename)

                # keep the name given by organize_raw_dataset.py
                # (amora_1, not_amora_1, ...), always saved as .jpg
                stem = os.path.splitext(filename)[0]
                output_path = os.path.join(output_class_dir, f"{stem}.jpg")

                process_image(input_path, output_path)
                count += 1

        print(f"{cls}: {count} images processed")

    print("Processing completed")

if __name__ == "__main__":
    process_dataset()
