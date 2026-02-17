"use client"

import * as tf from "@tensorflow/tfjs"
import "@tensorflow/tfjs-backend-webgl"
import { useEffect, useRef, useState } from "react"

type Language = "en" | "pt"

export default function Home() {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [label, setLabel] = useState<string>("Loading model...")
  const [confidence, setConfidence] = useState<number>(0)
  const [imageURL, setImageURL] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>("en")

  const imageRef = useRef<HTMLImageElement | null>(null)

  const translations = {
    en: {
      title: "Amora Detector 🍓",
      upload: "Choose Image",
      loading: "Loading model...",
      ready: "Upload an image",
      analyzing: "Analyzing...",
      blackberry: "🍓 It is Amora",
      notBlackberry: "❌ Not Amora",
      confidence: "Confidence",
      switchLang: "Português"
    },
    pt: {
      title: "Detector de Amora 🍓",
      upload: "Escolher Imagem",
      loading: "Carregando modelo...",
      ready: "Envie uma imagem",
      analyzing: "Analisando...",
      blackberry: "🍓 É a Amora",
      notBlackberry: "❌ Não é a Amora",
      confidence: "Confiança",
      switchLang: "English"
    }
  }

  const t = translations[language]

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready()
      await tf.setBackend("webgl")

      const loadedModel = await tf.loadLayersModel(
        "/amora_model_tfjs/model.json"
      )

      setModel(loadedModel)
      setLabel(t.ready)
    }

    loadModel()
  }, [])

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    const file = event.target.files[0]
    const url = URL.createObjectURL(file)
    setImageURL(url)
  }

  const runModel = async () => {
    if (!model || !imageRef.current) return

    setLabel(t.analyzing)

    const tensor = tf.browser
      .fromPixels(imageRef.current)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims()

    const prediction = model.predict(tensor) as tf.Tensor
    const data = await prediction.data()

    const probability = data[0]

    // Ajuste aqui se estiver invertido
    const isBlackberry = probability < 0.5
    const finalProb = isBlackberry ? 1 - probability : probability

    setConfidence(Number((finalProb * 100).toFixed(2)))
    setLabel(isBlackberry ? t.blackberry : t.notBlackberry)

    tensor.dispose()
    prediction.dispose()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 relative">

        <button
          onClick={() =>
            setLanguage(language === "en" ? "pt" : "en")
          }
          className="absolute top-4 right-4 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg transition"
        >
          {t.switchLang}
        </button>

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

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {label}
          </h2>

          {confidence > 0 && (
            <>
              <p className="text-gray-600">
                {t.confidence}: {confidence}%
              </p>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
