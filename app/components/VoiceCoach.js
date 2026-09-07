"use client";

import { useEffect, useRef, useState } from "react";
import { langCodes } from "../lib/languages";

export default function VoiceCoach() {
  const [language, setLanguage] = useState("English");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(localStorage.getItem("gbk_language") || "English");
    };

    syncLanguage();

    window.addEventListener("gbk-language-change", syncLanguage);

    return () => {
      window.removeEventListener("gbk-language-change", syncLanguage);
    };
  }, []);

  function speak(text, speakLanguage = "English") {
    if (!text || typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCodes[speakLanguage] || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }

  async function askGBK(text = heard) {
    const value = String(text || "").trim();

    if (!value) return;

    setBusy(true);
    setStatus("Thinking…");
    setAnswer(null);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: value,
          language,
          targetLanguage: "English",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Tutor request failed");
      }

      setAnswer(data);

      setStatus(
        data.mode === "ai"
          ? "GBK AI coach ready"
          : "GBK AI practice mode"
      );

      const voiceText =
        data.corrected ||
        data.translation ||
        data.reply ||
        "";

      if (voiceText) {
        speak(voiceText, data.targetLanguage || "English");
      }
    } catch (error) {
      console.error("GBK AI tutor error:", error);

      setAnswer({
        original: value,
        reply: "I could not process that right now. Please try again.",
        corrected: "",
        explanation: "The GBK AI connection could not be completed.",
      });

      setStatus("Please try again");
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
      setStatus("Voice recognition is not supported. Please use Chrome.");
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognition.lang = langCodes[language] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setStatus(`Listening in ${language}…`);
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
      console.error("Speech recognition error:", event.error);
      setListening(false);
      setStatus("Voice input stopped. Please try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();

    setListening(false);
    setStatus("Stopped");

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }

  function listenToSentence() {
    const sentence =
      answer?.translation ||
      answer?.corrected ||
      answer?.reply ||
      heard ||
      "I want to learn English.";

    speak(sentence, answer?.targetLanguage || "English");
  }

  function repeatCorrection() {
    const sentence =
      answer?.corrected ||
      answer?.translation ||
      answer?.reply ||
      heard;

    speak(sentence, answer?.targetLanguage || "English");
  }

  function practiceAgain() {
    setHeard("");
    setAnswer(null);
    setStatus("");
    window.speechSynthesis?.cancel();
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <section className="card voiceCard">

      <div className="voiceHead">
        <div>
          <span className="badge">🎙️ Voice Coach</span>

          <h2>Talk to GBK AI</h2>

          <p>
            Listen, speak, get corrected, repeat and improve.
          </p>
        </div>

        <div className={listening ? "mic live" : "mic"}>
          {listening ? "🔴" : "🎙️"}
        </div>
      </div>

      <textarea
        value={heard}
        onChange={(event) => setHeard(event.target.value)}
        placeholder="Speak or type in English…"
        rows={3}
      />

      <div className="actions">

        <button
          className="btn primary"
          onClick={startListening}
          disabled={listening || busy}
        >
          🎙️ {listening ? "Listening…" : "Start"}
        </button>

        <button
          className="btn"
          onClick={() => askGBK()}
          disabled={busy || !heard.trim()}
        >
          ✨ {busy ? "Thinking…" : "Ask GBK AI"}
        </button>

        <button
          className="btn"
          onClick={stopListening}
        >
          ⏹ Stop
        </button>

      </div>

      {status && (
        <p className="status">{status}</p>
      )}

      <div className="coachSteps">

        <div className="coachStep">
          <div className="stepNumber">1</div>

          <div className="stepContent">
            <h3>🎧 Listen</h3>

            <p>
              Listen to the sentence from GBK AI.
            </p>

            <button
              className="btn"
              onClick={listenToSentence}
            >
              🔊 Listen
            </button>
          </div>
        </div>

        <div className="coachStep">
          <div className="stepNumber">2</div>

          <div className="stepContent">
            <h3>🎙️ Speak</h3>

            <p>
              Speak the sentence clearly.
            </p>

            <button
              className="btn primary"
              onClick={startListening}
              disabled={listening || busy}
            >
              🎙️ {listening ? "Listening…" : "Speak"}
            </button>
          </div>
        </div>

        <div className="coachStep">
          <div className="stepNumber">3</div>

          <div className="stepContent">
            <h3>✨ GBK AI Correction</h3>

            <p>
              Get instant feedback and a corrected answer.
            </p>

            {answer ? (
              <>
                <div className="coachResult">
                  <strong>You said</strong>
                  <p>{answer.original || heard}</p>

                  <strong>
                    GBK AI correction / answer
                  </strong>

                  <p>
                    {answer.corrected ||
                      answer.reply ||
                      "No correction needed."}
                  </p>

                  {answer.explanation && (
                    <>
                      <strong>Why</strong>
                      <p>{answer.explanation}</p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="coachResult">
                Your answer and GBK AI correction will appear here.
              </div>
            )}
          </div>
        </div>

        <div className="coachStep">
          <div className="stepNumber">4</div>

          <div className="stepContent">
            <h3>🔊 Repeat</h3>

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
        </div>

        <div className="coachStep">
          <div className="stepNumber">5</div>

          <div className="stepContent">
            <h3>🔄 Practice Again / Improve</h3>

            <p>
              Try again with a new sentence or the same one.
            </p>

            <button
              className="btn"
              onClick={practiceAgain}
            >
              🔄 Practice Again
            </button>
          </div>
        </div>

      </div>

    </section>
  );
}
