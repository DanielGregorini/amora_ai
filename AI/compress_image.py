from PIL import Image
import os
import shutil

INPUT_DIR = "dataset"
OUTPUT_DIR = "dataset_compressed"

MAX_SIZE = 600
JPEG_QUALITY = 70

CLASSES = ["amora", "not_amora"]

def compress_image(input_path, output_path):
    """Convert to JPG, compress, and resize if larger than 600px while keeping aspect ratio"""
    try:
        with Image.open(input_path) as img:
            img = img.convert("RGB")

            # Resize only if larger than MAX_SIZE
            if img.width > MAX_SIZE or img.height > MAX_SIZE:
                img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)

            img.save(output_path, "JPEG", quality=JPEG_QUALITY, optimize=True)

    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def compress_dataset(input_dir=INPUT_DIR, output_dir=OUTPUT_DIR):

    # Remove output folder if exists
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

    os.makedirs(output_dir, exist_ok=True)

    for cls in CLASSES:
        input_class_dir = os.path.join(input_dir, cls)
        output_class_dir = os.path.join(output_dir, cls)

        os.makedirs(output_class_dir, exist_ok=True)

        count = 1

        for filename in sorted(os.listdir(input_class_dir)):
            if filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):

                input_path = os.path.join(input_class_dir, filename)

                new_filename = f"{cls}_{count:04d}.jpg"
                output_path = os.path.join(output_class_dir, new_filename)

                compress_image(input_path, output_path)
                count += 1

        print(f"✅ {cls}: {count - 1} images compressed")

    print("Compression completed 🚀")


if __name__ == "__main__":
    compress_dataset()