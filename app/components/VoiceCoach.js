"use client";

import { useEffect, useRef, useState } from "react";
import { langCodes } from "../lib/languages";

export default function VoiceCoach({
  targetLanguage = "English",
  onResult,
}) {
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState(null);
  const recognitionRef = useRef(null);

  const speak = (text) => {
    if (!text || typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCodes[targetLanguage] || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const askGBK = async (text) => {
    const value = String(text || "").trim();

    if (!value) return;

    setBusy(true);
    setAnswer(null);

    try {
      if (onResult) {
        const result = await onResult(value, targetLanguage);

        setAnswer(result);

        const voiceText =
          typeof result === "string"
            ? result
            : result?.reply ||
              result?.corrected ||
              "";

        if (voiceText) speak(voiceText);

        return;
      }

      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: value,
          language: targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Tutor request failed");
      }

      setAnswer(data);

      const voiceText =
        data.reply ||
        data.corrected ||
        data.translation ||
        "";

      if (voiceText) {
        speak(voiceText);
      }
    } catch (error) {
      console.error("GBK AI tutor error:", error);

      setAnswer({
        reply: "I could not process that right now. Please try again.",
        mode: "local",
      });
    } finally {
      setBusy(false);
    }
  };

  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser. Please use Chrome."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = langCodes[targetLanguage] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setAnswer(null);
    };

    recognition.onresult = async (event) => {
      const text =
        event.results?.[0]?.[0]?.transcript?.trim() || "";

      setHeard(text);
      setListening(false);

      if (text) {
        await askGBK(text);
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  };

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
        Speak naturally. GBK AI listens, responds, and helps you
        practice.
      </p>

      <div className="voiceActions">
        {!listening ? (
          <button
            onClick={startListening}
            disabled={busy}
          >
            🎙️ {busy ? "Thinking..." : "Start"}
          </button>
        ) : (
          <button onClick={stopListening}>
            ⏹ Stop
          </button>
        )}
      </div>

      {listening && (
        <p>
          🔴 Listening in <b>{targetLanguage}</b>...
        </p>
      )}

      {heard && (
        <div className="voiceResult">
          <strong>You said:</strong>
          <p>{heard}</p>
        </div>
      )}

      {answer && (
        <div className="voiceResult">
          <strong>GBK AI:</strong>

          <p>
            {answer.reply ||
              answer.corrected ||
              answer.answer ||
              answer}
          </p>

          <button
            onClick={() =>
              speak(
                answer.reply ||
                  answer.corrected ||
                  answer.answer ||
                  answer
              )
            }
          >
            🔊 Listen again
          </button>
        </div>
      )}
    </section>
  );
}
