# AMORA AI - Image Classifier

AMORA is an AI model designed to classify whether an image contains an **amora** or **not_amora**.

This project includes:

* Dataset preprocessing
* Model training
* Web-ready TensorFlow.js model export
* Next.js frontend inference

---

## 📁 Project Structure

```
AI/
├── dataset/
│   ├── amora/
│   └── not_amora/
├── dataset_processed/
├── output/
├── preprocess_images.py
├── train_amora.ipynb

frontend/
├── public/
│   └── amora_model_tfjs/
├── app/
│   └── page.tsx
├── package.json
├── tailwind.config.js
└── next.config.js
```


---

## 🚀 How to Run the AI Model

### 1️⃣ Preprocess the Dataset

Before training the model, you must preprocess the images.

Navigate to the **AI folder** and run:

```bash
cd AI
python3 preprocess_images.py
```

This will:

* Convert all images to JPG
* Compress images
* Resize images (if larger than 800x800)
* Maintain aspect ratio
* Generate the processed dataset in:

```
dataset_processed/
```

---

### 2️⃣ Train the Model

After preprocessing is completed, open and run:

```
train_amora.ipynb
```

Run all cells to train the model.

This notebook will:

* Load the processed dataset
* Train the AI model
* Save the trained model

---

### 3️⃣ Output Files

After training, the generated models will be located in:

```
output/
```

Inside this folder you will find:

| File             | Description                   |
| ---------------- | ----------------------------- |
| `.keras` / `.h5` | Trained TensorFlow model      |
| `model.json`     | Web-ready TensorFlow.js model |
| `.bin` files     | Model weights for browser use |

The **TensorFlow.js model** can be used directly in the web frontend.

---

## 🌐 Running on Web (Next.js)

Move the TensorFlow.js model folder from:

```
output/
```

To your frontend project:

```
public/amora_model_tfjs/
```

Then load the model in the browser using:

```ts
await tf.loadLayersModel("/amora_model_tfjs/model.json")
```

---

## 🧠 Notes

* Dataset must contain two folders:

  * `amora`
  * `not_amora`
* Preprocessing is required before training.
* Training without preprocessing may affect accuracy.

---

## 📦 Requirements

Install Python dependencies:

```bash
pip install pillow tensorflow opencv-python
```

---

## ✅ Workflow Summary

1. Run preprocessing:

```bash
python3 preprocess_images.py
```

2. Train the model:

```
train_amora.ipynb
```

3. Get model from:

```
output/
```

4. Use on web with TensorFlow.js

---

## 🍓 AMORA AI

Detecting Amora with Deep Learning.
