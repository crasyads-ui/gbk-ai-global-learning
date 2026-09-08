"use client";

import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  "English", "Telugu", "Hindi", "Marathi", "Bengali", "Tamil", "Kannada",
  "Malayalam", "Gujarati", "Punjabi", "Urdu", "Spanish", "French", "German",
  "Portuguese", "Italian", "Arabic", "Turkish", "Russian", "Indonesian",
  "Vietnamese", "Thai", "Japanese", "Korean", "Chinese"
];

const LANG_CODES = {
  English: "en-US",
  Telugu: "te-IN",
  Hindi: "hi-IN",
  Marathi: "mr-IN",
  Bengali: "bn-IN",
  Tamil: "ta-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Gujarati: "gu-IN",
  Punjabi: "pa-IN",
  Urdu: "ur-PK",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Portuguese: "pt-PT",
  Italian: "it-IT",
  Arabic: "ar-SA",
  Turkish: "tr-TR",
  Russian: "ru-RU",
  Indonesian: "id-ID",
  Vietnamese: "vi-VN",
  Thai: "th-TH",
  Japanese: "ja-JP",
  Korean: "ko-KR",
  Chinese: "zh-CN"
};

export default function VoiceCoach({
  path = "Learning Paths",
  level = "Beginner",
  lesson = "",
  targetLanguage = "English"
}) {
  const recognitionRef = useRef(null);

  const [myLanguage, setMyLanguage] = useState("English");
  const [selectedTarget, setSelectedTarget] = useState(targetLanguage || "English");

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState("Ready");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [translation, setTranslation] = useState("");
  const [corrected, setCorrected] = useState("");
  const [explanation, setExplanation] = useState("");
  const [pronunciation, setPronunciation] = useState("");

  useEffect(() => {
    try {
      const savedMy = localStorage.getItem("gbk_my_language");
      const savedTarget = localStorage.getItem("gbk_target_language");

      if (savedMy) setMyLanguage(savedMy);
      if (savedTarget) setSelectedTarget(savedTarget);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("gbk_my_language", myLanguage);
      localStorage.setItem("gbk_target_language", selectedTarget);
    } catch {}
  }, [myLanguage, selectedTarget]);

  // Automatically explain the selected lesson aloud.
  useEffect(() => {
    if (!lesson) return;

    let cancelled = false;

    async function loadLesson() {
      setBusy(true);
      setStatus("GBK AI is preparing the lesson...");
      setReply("");
      setTranslation("");
      setCorrected("");
      setExplanation("");
      setPronunciation("");

      try {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: `Teach me this lesson: ${lesson}`,
            language: myLanguage,
            targetLanguage: selectedTarget,
            path,
            level,
            lesson
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "AI request failed");
        }

        if (cancelled) return;

        const aiReply = data.reply || data.translation || "";

        setReply(aiReply);
        setTranslation(data.translation || "");
        setCorrected(data.corrected || "");
        setExplanation(data.explanation || "");
        setPronunciation(data.pronunciation || "");
        setStatus("Lesson ready");

        // Automatically speak the lesson explanation.
        const textToSpeak =
          data.explanation ||
          data.reply ||
          data.translation ||
          lesson;

        if (textToSpeak) {
          speak(textToSpeak, selectedTarget);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error.message || "Unable to load lesson");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    loadLesson();

    return () => {
      cancelled = true;
      stopVoice();
    };
  }, [lesson, path, level, selectedTarget]);

  function speak(text, language) {
    if (!text || typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODES[language] || "en-US";
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setSpeaking(true);
      setStatus("GBK AI is speaking...");
    };

    utterance.onend = () => {
      setSpeaking(false);
      setStatus("Ready to practice");
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setStatus("Voice stopped");
    };

    window.speechSynthesis.speak(utterance);
  }

  // IMPORTANT: this stops GBK AI audio immediately.
  function stopVoice() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setSpeaking(false);
    setListening(false);
    setStatus("Stopped");
  }

  function startListening() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Microphone speech recognition is not supported");
      return;
    }

    // Stop any GBK AI speech before microphone practice.
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = LANG_CODES[myLanguage] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setSpeaking(false);
      setStatus("Listening...");
    };

    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      setHeard(text);
      setStatus("Speech captured");
    };

    recognition.onerror = (event) => {
      setListening(false);
      setStatus(event.error || "Microphone error");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }

  async function askGBK() {
    if (!heard.trim()) {
      setStatus("Speak something first");
      return;
    }

    setBusy(true);
    setStatus("GBK AI is checking your speech...");

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: heard,
          language: myLanguage,
          targetLanguage: selectedTarget,
          path,
          level,
          lesson
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "AI request failed");
      }

      setReply(data.reply || "");
      setTranslation(data.translation || "");
      setCorrected(data.corrected || "");
      setExplanation(data.explanation || "");
      setPronunciation(data.pronunciation || "");
      setStatus("Correction ready");

      const speakText =
        data.corrected ||
        data.reply ||
        data.translation;

      if (speakText) {
        speak(speakText, selectedTarget);
      }
    } catch (error) {
      setStatus(error.message || "AI error");
    } finally {
      setBusy(false);
    }
  }

  const stopDisabled = !listening && !speaking && !busy;

  return (
    <section className="voice-coach">
      <div className="coach-header">
        <div>
          <h2>🎙️ GBK AI Voice Coach</h2>
          <p>
            {path} · {level}
            {lesson ? ` · ${lesson}` : ""}
          </p>
        </div>
      </div>

      <div className="language-grid">
        <label>
          🌐 My Language
          <select
            value={myLanguage}
            onChange={(e) => setMyLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang}>{lang}</option>
            ))}
          </select>
        </label>

        <label>
          🎯 I want to learn
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang}>{lang}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="coach-controls">
        <button
          className="btn"
          onClick={startListening}
          disabled={listening || busy}
        >
          🎙️ Start
        </button>

        <button
          className="btn"
          onClick={askGBK}
          disabled={!heard.trim() || busy}
        >
          ✨ Ask GBK AI
        </button>

        <button
          className="btn stop"
          onClick={stopVoice}
          disabled={stopDisabled}
        >
          ⏹ Stop Voice
        </button>
      </div>

      <div className="voice-status">
        <strong>{status}</strong>
        {speaking && <span> 🔊</span>}
        {listening && <span> 🎙️</span>}
      </div>

      <div className="steps">
        <div>1. 🎧 Listen</div>
        <div>2. 🎙️ Speak</div>
        <div>3. ✨ GBK AI Correction</div>
        <div>4. 🔊 Repeat</div>
        <div>5. 🔄 Practice Again</div>
      </div>

      {lesson && (
        <div className="lesson-box">
          <small>Current lesson</small>
          <h3>{lesson}</h3>
        </div>
      )}

      {heard && (
        <div className="result-box">
          <h3>🎙️ You said</h3>
          <p>{heard}</p>
        </div>
      )}

      {reply && (
        <div className="result-box">
          <h3>✨ GBK AI</h3>
          <p>{reply}</p>
        </div>
      )}

      {translation && (
        <div className="result-box">
          <h3>🌐 Translation</h3>
          <p>{translation}</p>
        </div>
      )}

      {corrected && (
        <div className="result-box">
          <h3>✅ Corrected</h3>
          <p>{corrected}</p>
        </div>
      )}

      {explanation && (
        <div className="result-box">
          <h3>💡 Why?</h3>
          <p>{explanation}</p>
        </div>
      )}

      {pronunciation && (
        <div className="result-box">
          <h3>🗣️ Pronunciation</h3>
          <p>{pronunciation}</p>
        </div>
      )}
    </section>
  );
}
