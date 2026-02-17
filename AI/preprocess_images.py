from PIL import Image
import os

# Caminhos
INPUT_DIR = "dataset"
OUTPUT_DIR = "dataset_processed"

IMAGE_SIZE = (400, 400)
JPEG_QUALITY = 90

CLASSES = ["amora", "not_amora"]

os.makedirs(OUTPUT_DIR, exist_ok=True)

def process_image(input_path, output_path):
    try:
        with Image.open(input_path) as img:
            img = img.convert("RGB")
            img = img.resize(IMAGE_SIZE, Image.LANCZOS)
            img.save(output_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
    except Exception as e:
        print(f"Erro em {input_path}: {e}")

for cls in CLASSES:
    input_class_dir = os.path.join(INPUT_DIR, cls)
    output_class_dir = os.path.join(OUTPUT_DIR, cls)

    os.makedirs(output_class_dir, exist_ok=True)

    count = 1  # contador por classe

    for filename in sorted(os.listdir(input_class_dir)):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            input_path = os.path.join(input_class_dir, filename)

            new_filename = f"{cls}_{count:04d}.jpg"
            output_path = os.path.join(output_class_dir, new_filename)

            process_image(input_path, output_path)
            count += 1

    print(f"✅ {cls}: {count - 1} imagens processadas")

print("concluido")
