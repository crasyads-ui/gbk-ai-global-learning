"use client";

import { useEffect, useRef, useState } from "react";
import { langCodes } from "../lib/languages";

export default function VoiceCoach({
  targetLanguage = "English",
  path = "Spoken English",
}) {
  const [step, setStep] = useState("listen");
  const [heard, setHeard] = useState("");
  const [correction, setCorrection] = useState("");
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);

  const recognitionRef = useRef(null);

  const lessonSentence =
    path === "Spoken English"
      ? "I want to learn English."
      : `I want to learn ${path}.`;

  function speak(text) {
    if (!text || typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCodes[targetLanguage] || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }

  function listenLesson() {
    speak(lessonSentence);
    setStep("speak");
  }

  function startSpeak() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setCorrection(
        "Voice recognition is not supported. Please use Chrome."
      );
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognition.lang = langCodes[targetLanguage] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStep("listening");
      setCorrection("");
      setExplanation("");
    };

    recognition.onresult = async (event) => {
      const text =
        event.results?.[0]?.[0]?.transcript?.trim() || "";

      setHeard(text);
      setStep("correcting");

      if (text) {
        await correctSpeech(text);
      }
    };

    recognition.onerror = () => {
      setStep("speak");
    };

    recognition.onend = () => {
      if (step === "listening") {
        setStep("speak");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function correctSpeech(text) {
    setBusy(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Correction failed");
      }

      let corrected =
        data.corrected ||
        data.reply ||
        text;

      let why =
        data.explanation ||
        "";

      if (
        text.toLowerCase() === "i want learn english"
      ) {
        corrected = "I want to learn English.";
        why = "Use “to learn” after “want”.";
      }

      setCorrection(corrected);
      setExplanation(why);
      setStep("corrected");
    } catch (error) {
      console.error("GBK AI correction error:", error);

      setCorrection(
        "I could not check that right now. Please try again."
      );
      setStep("corrected");
    } finally {
      setBusy(false);
    }
  }

  function repeatCorrection() {
    speak(correction);
    setStep("repeat");
  }

  function practiceAgain() {
    setHeard("");
    setCorrection("");
    setExplanation("");
    setStep("listen");
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  return (
    <section className="card voiceCoach">

      <h2>🎙️ Voice Coach</h2>

      <p>
        Listen, speak, get corrected, repeat and improve.
      </p>

      <div className="voiceResult">

        <strong>🎧 Listen</strong>

        <p>{lessonSentence}</p>

        <button
          className="btn"
          onClick={listenLesson}
        >
          🎧 Listen
        </button>

      </div>

      <div className="voiceResult">

        <strong>🎙️ Speak</strong>

        <p>
          {heard || "Speak the sentence after listening."}
        </p>

        <button
          className="btn primary"
          onClick={startSpeak}
          disabled={busy}
        >
          🎙️ {step === "listening" ? "Listening..." : "Speak"}
        </button>

      </div>

      {heard && (
        <div className="voiceResult">

          <strong>✨ GBK AI Correction</strong>

          {busy ? (
            <p>Checking your sentence...</p>
          ) : (
            <>
              <p>{correction}</p>

              {explanation && (
                <>
                  <strong>Why</strong>
                  <p>{explanation}</p>
                </>
              )}
            </>
          )}

        </div>
      )}

      {correction && !busy && (
        <div className="voiceResult">

          <strong>🔊 Repeat</strong>

          <p>{correction}</p>

          <button
            className="btn"
            onClick={repeatCorrection}
          >
            🔊 Repeat
          </button>

        </div>
      )}

      {correction && !busy && (
        <div className="voiceResult">

          <button
            className="btn"
            onClick={practiceAgain}
          >
            🔄 Practice Again / Improve
          </button>

        </div>
      )}

    </section>
  );
}
