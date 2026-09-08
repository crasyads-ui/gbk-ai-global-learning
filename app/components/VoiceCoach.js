"use client";

import { useEffect, useRef, useState } from "react";
import { langCodes } from "../lib/languages";

const LANGUAGES = [
  "English",
  "తెలుగు",
  "हिन्दी",
  "मराठी",
  "বাংলা",
  "தமிழ்",
  "ಕನ್ನಡ",
  "മലയാളം",
  "ગુજરાતી",
  "ਪੰਜਾਬੀ",
  "اردو",
  "Español",
  "Français",
  "Deutsch",
  "Português",
  "Italiano",
  "العربية",
  "Türkçe",
  "Русский",
  "Bahasa Indonesia",
  "Tiếng Việt",
  "ไทย",
  "日本語",
  "한국어",
  "中文",
];

const LANGUAGE_PATTERNS = [
  ["తెలుగు", /[\u0C00-\u0C7F]/],
  ["हिन्दी", /[\u0900-\u097F]/],
  ["मराठी", /[\u0900-\u097F]/],
  ["বাংলা", /[\u0980-\u09FF]/],
  ["தமிழ்", /[\u0B80-\u0BFF]/],
  ["ಕನ್ನಡ", /[\u0C80-\u0CFF]/],
  ["മലയാളം", /[\u0D00-\u0D7F]/],
  ["ગુજરાતી", /[\u0A80-\u0AFF]/],
  ["ਪੰਜਾਬੀ", /[\u0A00-\u0A7F]/],
  ["اردو", /[\u0600-\u06FF]/],
  ["العربية", /[\u0600-\u06FF]/],
  ["ไทย", /[\u0E00-\u0E7F]/],
  ["日本語", /[\u3040-\u30FF]/],
  ["한국어", /[\uAC00-\uD7AF]/],
  ["中文", /[\u4E00-\u9FFF]/],
  ["Русский", /[\u0400-\u04FF]/],
];

const TARGET_ALIASES = {
  english: "English",
  telugu: "తెలుగు",
  hindi: "हिन्दी",
  marathi: "मराठी",
  bengali: "বাংলা",
  bangla: "বাংলা",
  tamil: "தமிழ்",
  kannada: "ಕನ್ನಡ",
  malayalam: "മലയാളം",
  gujarati: "ગુજરાતી",
  punjabi: "ਪੰਜਾਬੀ",
  urdu: "اردو",
  spanish: "Español",
  french: "Français",
  german: "Deutsch",
  portuguese: "Português",
  italian: "Italiano",
  arabic: "العربية",
  turkish: "Türkçe",
  russian: "Русский",
  indonesian: "Bahasa Indonesia",
  vietnamese: "Tiếng Việt",
  thai: "ไทย",
  japanese: "日本語",
  korean: "한국어",
  chinese: "中文",
  mandarin: "中文",
};

function detectLanguage(text, fallback = "English") {
  const value = String(text || "").trim();

  for (const [language, pattern] of LANGUAGE_PATTERNS) {
    if (pattern.test(value)) return language;
  }

  return fallback;
}

function detectRequestedLanguage(text) {
  const value = String(text || "").toLowerCase();

  for (const [alias, language] of Object.entries(TARGET_ALIASES)) {
    const patterns = [
      `in ${alias}`,
      `into ${alias}`,
      `to ${alias}`,
      `learn ${alias}`,
      `speak ${alias}`,
      `practice ${alias}`,
      `teach me ${alias}`,
      `teach ${alias}`,
      `conversation in ${alias}`,
    ];

    if (patterns.some((pattern) => value.includes(pattern))) {
      return language;
    }
  }

  return "";
}

function getVoiceLanguage(language) {
  return langCodes?.[language] || "en-US";
}

export default function VoiceCoach() {
  const recognitionRef = useRef(null);

  const [language, setLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("English");

  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [learningLanguage, setLearningLanguage] = useState("English");

  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);

  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLanguage =
      localStorage.getItem("gbk_language") || "English";

    const savedTarget =
      localStorage.getItem("gbk_target_language") || "English";

    setLanguage(savedLanguage);
    setTargetLanguage(
      LANGUAGES.includes(savedTarget) ? savedTarget : "English"
    );

    const syncLanguage = () => {
      setLanguage(localStorage.getItem("gbk_language") || "English");
    };

    window.addEventListener("gbk-language-change", syncLanguage);

    return () => {
      window.removeEventListener("gbk-language-change", syncLanguage);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  function changeTargetLanguage(value) {
    setTargetLanguage(value);
    setLearningLanguage(value);

    if (typeof window !== "undefined") {
      localStorage.setItem("gbk_target_language", value);
    }
  }

  function speak(text, speakLanguage) {
    if (typeof window === "undefined") return;
    if (!text) return;

    if (!window.speechSynthesis) {
      setStatus("Voice output is not supported in this browser.");
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getVoiceLanguage(speakLanguage);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    } catch {
      setStatus("Voice output could not start.");
    }
  }

  async function askGBK(value) {
    const text = String(value || "").trim();

    if (!text) {
      setStatus("Speak or type something first.");
      return;
    }

    setBusy(true);
    setStatus("GBK AI is listening and preparing your lesson...");

    const source = detectLanguage(text, language);

    const requestedTarget = detectRequestedLanguage(text);
    const selectedTarget = requestedTarget || targetLanguage || "English";

    setDetectedLanguage(source);
    setLearningLanguage(selectedTarget);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: source,
          targetLanguage: selectedTarget,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "AI request failed");
      }

      const result = {
        ...data,
        sourceLanguage: data?.sourceLanguage || source,
        targetLanguage: data?.targetLanguage || selectedTarget,
      };

      setAnswer(result);
      setStatus("Ready");

      const finalText =
        result.corrected ||
        result.translation ||
        result.reply ||
        result.answer ||
        "";

      if (finalText) {
        speak(
          finalText,
          result.targetLanguage || selectedTarget
        );
      }
    } catch (error) {
      console.error(error);

      setAnswer({
        sourceLanguage: source,
        targetLanguage: selectedTarget,
        reply:
          "GBK AI practice mode is ready. Please try your sentence again.",
        corrected: "",
        translation: "",
        explanation:
          `Detected language: ${source}. Learning language: ${selectedTarget}.`,
      });

      setStatus("Practice mode");
    } finally {
      setBusy(false);
    }
  }

  function startListening() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus(
        "Voice recognition is not supported in this browser. You can type instead."
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SpeechRecognition();

    recognition.lang = getVoiceLanguage(language);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setStatus(`Listening in ${language}...`);
    };

    recognition.onresult = (event) => {
      const text =
        event?.results?.[0]?.[0]?.transcript?.trim() || "";

      if (!text) {
        setStatus("I didn't hear a sentence. Please try again.");
        return;
      }

      setHeard(text);
      setListening(false);

      askGBK(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);

      setListening(false);

      if (event?.error === "not-allowed") {
        setStatus("Microphone permission is required.");
      } else {
        setStatus("Voice recognition stopped. Please try again.");
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
      setStatus("Could not start the microphone.");
    }
  }

  function stopListening() {
  // Stop GBK AI loud voice immediately
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  // Stop microphone
  if (recognitionRef.current) {
    try {
      recognitionRef.current.stop();
    } catch {}
  }

  setListening(false);
  setStatus("Stopped");
}

  function getLearningSentence() {
    if (!answer) return "";

    return (
      answer.corrected ||
      answer.translation ||
      answer.reply ||
      ""
    );
  }

  function listenToSentence() {
    const sentence = getLearningSentence();

    if (!sentence) {
      setStatus("Ask GBK AI first.");
      return;
    }

    speak(
      sentence,
      answer?.targetLanguage || learningLanguage
    );
  }

  function repeatCorrection() {
    const sentence = getLearningSentence();

    if (!sentence) {
      setStatus("There is no correction to repeat yet.");
      return;
    }

    speak(
      sentence,
      answer?.targetLanguage || learningLanguage
    );
  }

  function practiceAgain() {
    setHeard("");
    setAnswer(null);
    setStatus("Ready for another practice sentence.");
  }

  return (
    <section className="voiceCoach">
      <div className="voiceCoachHeader">
        <div>
          <span className="badge">🎙️ Voice Coach</span>
          <h2>Talk to GBK AI</h2>
          <p>
            Listen, speak, get corrected, repeat and improve.
          </p>
        </div>
      </div>

      <div className="actions">
        <div>
          <strong>🗣️ My language</strong>
          <div>{language}</div>
        </div>

        <label>
          <strong>🎯 I want to learn</strong>
          <select
            className="btn"
            value={targetLanguage}
            onChange={(event) =>
              changeTargetLanguage(event.target.value)
            }
            aria-label="I want to learn"
          >
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <textarea
        className="voiceCoachInput"
        value={heard}
        onChange={(event) => setHeard(event.target.value)}
        placeholder={`Speak or type in ${language}...`}
        rows={4}
      />

      <div className="actions">
        <button
          className="btn primary"
          onClick={startListening}
          disabled={busy || listening}
        >
          🎙️ Start
        </button>

        <button
          className="btn"
          onClick={() => askGBK(heard)}
          disabled={busy || !heard.trim()}
        >
          ✨ Ask GBK AI
        </button>

        <button
          className="btn"
          onClick={stopListening}
          disabled={!listening}
        >
          ⏹ Stop
        </button>
      </div>

      <div className="status">
        {listening ? "🎙️ " : ""}
        {status}
      </div>

      <div className="steps">
        <div className="step">
          <strong>1️⃣ 🎧 Listen</strong>
          <p>Listen to the translated or corrected sentence.</p>
          <button
            className="btn"
            onClick={listenToSentence}
            disabled={!answer}
          >
            🔊 Listen
          </button>
        </div>

        <div className="step">
          <strong>2️⃣ 🎙️ Speak</strong>
          <p>Speak the sentence clearly.</p>
          <button
            className="btn primary"
            onClick={startListening}
            disabled={busy || listening}
          >
            🎙️ Speak
          </button>
        </div>

        <div className="step">
          <strong>3️⃣ ✨ GBK AI Correction</strong>
          <p>GBK AI translates, teaches and corrects your sentence.</p>

          {heard && (
            <div className="result">
              <strong>You said</strong>
              <p>{heard}</p>
            </div>
          )}

          {answer && (
            <>
              <div className="result">
                <strong>Detected language</strong>
                <p>
                  {answer.sourceLanguage || detectedLanguage}
                </p>
              </div>

              <div className="result">
                <strong>🎯 Learning language</strong>
                <p>
                  {answer.targetLanguage || learningLanguage}
                </p>
              </div>

              {answer.translation && (
                <div className="result">
                  <strong>Translation</strong>
                  <p>{answer.translation}</p>
                </div>
              )}

              <div className="result">
                <strong>✨ GBK AI correction / answer</strong>
                <p>
                  {answer.corrected ||
                    answer.reply ||
                    answer.answer}
                </p>
              </div>

              {answer.explanation && (
                <div className="result">
                  <strong>💡 Why</strong>
                  <p>{answer.explanation}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="step">
          <strong>4️⃣ 🔊 Repeat</strong>
          <p>
            Listen and repeat the corrected sentence.
          </p>
          <button
            className="btn"
            onClick={repeatCorrection}
            disabled={!answer}
          >
            🔊 Repeat
          </button>
        </div>

        <div className="step">
          <strong>5️⃣ 🔄 Practice Again / Improve</strong>
          <p>
            Try again with another sentence and improve.
          </p>
          <button
            className="btn"
            onClick={practiceAgain}
          >
            🔄 Practice Again
          </button>
        </div>
      </div>

      <div className="voiceCoachTip">
        💡 <strong>Tip:</strong> Choose the language you want to
        learn. GBK AI will use your language for understanding and
        explanations, then teach the selected target language.
      </div>
    </section>
  );
}
