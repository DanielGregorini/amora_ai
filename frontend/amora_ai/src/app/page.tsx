"use client"

import * as tf from "@tensorflow/tfjs"
import "@tensorflow/tfjs-backend-webgl"
import { useEffect, useRef, useState } from "react"

type Language = "en" | "pt"

export default function Home() {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [label, setLabel] = useState<string>("Loading model...")
  const [imageURL, setImageURL] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>("en")

  const [amoraProb, setAmoraProb] = useState<number>(0)
  const [notAmoraProb, setNotAmoraProb] = useState<number>(0)

  const imageRef = useRef<HTMLImageElement | null>(null)

  const translations = {
    en: {
      title: "Amora Detector 🍓",
      upload: "Choose Image",
      ready: "Upload an image",
      analyzing: "Analyzing...",
      blackberry: "🍓 It is Amora",
      notBlackberry: "❌ Not Amora",
      switchLang: "Português"
    },
    pt: {
      title: "Detector de Amora 🍓",
      upload: "Escolher Imagem",
      ready: "Envie uma imagem",
      analyzing: "Analisando...",
      blackberry: "🍓 É Amora",
      notBlackberry: "❌ Não é Amora",
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

    const notAmora = data[0]
    const amora = 1 - notAmora

    const amoraPercent = Number((amora * 100).toFixed(2))
    const notAmoraPercent = Number((notAmora * 100).toFixed(2))

    setAmoraProb(amoraPercent)
    setNotAmoraProb(notAmoraPercent)

    const isAmoraMain = amoraPercent > notAmoraPercent
    setLabel(isAmoraMain ? t.blackberry : t.notBlackberry)

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

        {(amoraProb > 0 || notAmoraProb > 0) && (
          <div className="space-y-4">

            {/* Main result */}
            <div className="text-center text-3xl font-bold text-purple-600">
              {label}
            </div>

            {/* Class 0 Amora */}
            <div>
              <p className="text-sm text-gray-600">
                Class 0 - Amora: {amoraProb}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${amoraProb}%` }}
                />
              </div>
            </div>

            {/* Class 1 Not Amora */}
            <div>
              <p className="text-sm text-gray-600">
                Class 1 - Not Amora: {notAmoraProb}%
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
  )
}