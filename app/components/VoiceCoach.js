"use client";

import { useEffect, useRef, useState } from "react";
import { langCodes } from "../lib/languages";

export default function VoiceCoach({
  targetLanguage = "English",
  onResult,
}) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState("");
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
      setAnswer("");
    };

    recognition.onresult = async (event) => {
      const text =
        event.results?.[0]?.[0]?.transcript?.trim() || "";

      setHeard(text);

      if (onResult) {
        try {
          const result = await onResult(text, targetLanguage);

          if (result) {
            const response =
              typeof result === "string"
                ? result
                : result.reply ||
                  result.corrected ||
                  result.answer ||
                  "";

            setAnswer(response);

            if (response) {
              speak(response);
            }
          }
        } catch (error) {
          console.error("Voice coach error:", error);
          setAnswer(
            "I could not process that right now. Please try again."
          );
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
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
          <button onClick={startListening}>
            🎙️ Start
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
          <p>{answer}</p>

          <button onClick={() => speak(answer)}>
            🔊 Listen again
          </button>
        </div>
      )}
    </section>
  );
}
