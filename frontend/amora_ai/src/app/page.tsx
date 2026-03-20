"use client";

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef, useState } from "react";

type Language = "en" | "pt";
type Status = "ready" | "analyzing" | "amora" | "not_amora";

export default function Home() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [status, setStatus] = useState<Status>("ready");

  const [amoraProb, setAmoraProb] = useState<number>(0);
  const [notAmoraProb, setNotAmoraProb] = useState<number>(0);

  const imageRef = useRef<HTMLImageElement | null>(null);

  const translations = {
    en: {
      title: "Amora Detector 🍓",
      upload: "Choose Image",
      ready: "Upload an image",
      analyzing: "Analyzing...",
      blackberry: "🍓 It is Amora",
      notBlackberry: "❌ Not Amora",
      switchLang: "Português",
      class0: "Class 0 - Amora",
      class1: "Class 1 - Not Amora",
      gallery: "Gallery",
      download: "Download",
    },
    pt: {
      title: "Detector de Amora 🍓",
      upload: "Escolher Imagem",
      ready: "Envie uma imagem",
      analyzing: "Analisando...",
      blackberry: "🍓 É Amora",
      notBlackberry: "❌ Não é Amora",
      switchLang: "English",
      class0: "Classe 0 - Amora",
      class1: "Classe 1 - Não Amora",
      gallery: "Galeria",
      download: "Baixar",
    },
  };

  const t = translations[language];

  const getLabel = () => {
    switch (status) {
      case "ready":
        return t.ready;
      case "analyzing":
        return t.analyzing;
      case "amora":
        return t.blackberry;
      case "not_amora":
        return t.notBlackberry;
      default:
        return "";
    }
  };

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      await tf.setBackend("webgl");

      const loadedModel = await tf.loadLayersModel(
        "/amora_model_tfjs/model.json",
      );

      setModel(loadedModel);
      setStatus("ready");
    };

    loadModel();
  }, []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setImageURL(url);
  };

  const runModel = async () => {
    if (!model || !imageRef.current) return;

    setStatus("analyzing");

    const tensor = tf.browser
      .fromPixels(imageRef.current)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims();

    const prediction = model.predict(tensor) as tf.Tensor;
    const data = await prediction.data();

    const notAmora = data[0];
    const amora = 1 - notAmora;

    const amoraPercent = Number((amora * 100).toFixed(2));
    const notAmoraPercent = Number((notAmora * 100).toFixed(2));

    setAmoraProb(amoraPercent);
    setNotAmoraProb(notAmoraPercent);

    const isAmoraMain = amoraPercent > notAmoraPercent;
    setStatus(isAmoraMain ? "amora" : "not_amora");

    tensor.dispose();
    prediction.dispose();
  };

  return (
    <main className="bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="min-h-screen flex items-center justify-center p-4">
        <button
          onClick={() => setLanguage(language === "en" ? "pt" : "en")}
          className="absolute top-4 right-4 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg transition"
        >
          {t.switchLang}
        </button>

        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 relative">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {t.title}
          </h1>

          <label className="block">
            <div className="w-full py-3 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer transition">
              {t.upload}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>

          {imageURL && (
            <img
              ref={imageRef}
              src={imageURL}
              alt="preview"
              onLoad={runModel}
              className="w-full rounded-xl object-cover"
            />
          )}

          {(amoraProb > 0 || notAmoraProb > 0) && (
            <div className="space-y-4">
              <div className="text-center text-3xl font-bold text-purple-600">
                {getLabel()}
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  {t.class0}: {amoraProb}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${amoraProb}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  {t.class1}: {notAmoraProb}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${notAmoraProb}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-4xl text-center font-bold mb-6">{t.gallery}</h1>

        <div className="flex gap-6 justify-center flex-wrap">
          <div className="w-[90%] sm:w-[40%] max-h-96 rounded-xl p-3">
            <img
              src="/amora_pictures/amora_01.jpeg"
              alt="amora 1"
              className="w-full h-auto rounded-lg"
            />
            <a
              href="/amora_pictures/amora_01.jpeg"
              download="amora_01.jpeg"
              className="mt-3 block text-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
            >
              Baixar
            </a>
          </div>

          <div className="w-[90%] sm:w-[20%] rounded-xl p-3">
            <img
              src="/amora_pictures/amora_02.jpeg"
              alt="amora 2"
              className="w-full h-auto rounded-lg"
            />
            <a
              href="/amora_pictures/amora_02.jpeg"
              download="amora_02.jpeg"
              className="mt-3 block text-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
            >
              Baixar
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
