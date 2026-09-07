"use client";

import { useEffect, useRef, useState } from "react";
import { languages, langCodes } from "../lib/languages";

export default function VoiceCoach({
  targetLanguage = "English",
  path = "AI Tutor",
}) {
  const [language, setLanguage] = useState("English");
  const [target, setTarget] = useState(targetLanguage);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    const syncLanguage = () => {
      const saved =
        localStorage.getItem("gbk_language") || "English";

      setLanguage(saved);

      if (saved === target) {
        const next =
          languages.find((item) => item !== saved) || "English";
        setTarget(next);
      }
    };

    syncLanguage();

    window.addEventListener(
      "gbk-language-change",
      syncLanguage
    );

    return () => {
      window.removeEventListener(
        "gbk-language-change",
        syncLanguage
      );
    };
  }, [target]);

  function speak(text, speakLanguage = "English") {
    if (
      !text ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang =
      langCodes[speakLanguage] || "en-US";

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }

  async function askGBK(text) {
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
          targetLanguage: target,
          path,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Tutor request failed"
        );
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
        speak(
          voiceText,
          data.targetLanguage || target
        );
      }
    } catch (error) {
      console.error(
        "GBK AI tutor error:",
        error
      );

      const fallback = {
        reply:
          "I can still help you practice. Please try again.",
        original: value,
        corrected: "",
        explanation:
          "The tutor connection could not be completed.",
        targetLanguage: target,
        mode: "local",
      };

      setAnswer(fallback);
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
      setStatus(
        "Voice recognition is not supported. Please use Chrome."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      langCodes[language] || "en-US";

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setStatus(
        `Listening in ${language}…`
      );
      setAnswer(null);
    };

    recognition.onresult = async (event) => {
      const text =
        event.results?.[0]?.[0]?.transcript?.trim() ||
        "";

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
      setStatus(
        "Voice input stopped. Please try again."
      );
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
    setStatus("Stopped");

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
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
    <section className="card voiceCard">
      <div className="voiceHead">
        <div>
          <span className="badge">
            🎙️ {path}
          </span>

          <h2>Talk to GBK AI</h2>

          <p>
            Speak in your language. GBK AI
            understands you and teaches your
            selected target language.
          </p>
        </div>

        <div
          className={
            listening ? "mic live" : "mic"
          }
        >
          {listening ? "🔴" : "🎙️"}
        </div>
      </div>

      <div className="languageGrid">
        <div>
          <label>
            <b>I speak</b>
          </label>

          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
          >
            {languages.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            <b>Target Language</b>
          </label>

          <select
            value={target}
            onChange={(event) =>
              setTarget(event.target.value)
            }
          >
            {languages.map((item) => (
              <option
                key={item}
                value={item}
                disabled={item === language}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={heard}
        onChange={(event) =>
          setHeard(event.target.value)
        }
        placeholder={`Speak or type in ${language}…`}
        rows={3}
      />

      <div className="actions">
        <button
          className="btn primary"
          onClick={startListening}
          disabled={listening || busy}
        >
          🎙️{" "}
          {listening
            ? "Listening…"
            : "Start"}
        </button>

        <button
          className="btn"
          onClick={() => askGBK(heard)}
          disabled={
            busy || !heard.trim()
          }
        >
          ✨{" "}
          {busy
            ? "Thinking…"
            : "Ask GBK AI"}
        </button>

        <button
          className="btn"
          onClick={stopListening}
        >
          ⏹ Stop
        </button>
      </div>

      {status && (
        <p className="status">
          {status}
        </p>
      )}

      {answer && (
        <div className="coachResult">

          <div>
            <b>You said</b>
            <p>
              {answer.original || heard}
            </p>
          </div>

          {answer.translation && (
            <div>
              <b>
                Learn this sentence
              </b>

              <p>
                {answer.translation}
              </p>

              <button
                className="btn"
                onClick={() =>
                  speak(
                    answer.translation,
                    answer.targetLanguage ||
                      target
                  )
                }
              >
                🔊 Listen
              </button>
            </div>
          )}

          {(answer.corrected ||
            answer.reply) && (
            <div>
              <b>
                GBK AI answer / correction
              </b>

              <p>
                {answer.corrected ||
                  answer.reply}
              </p>

              <button
                className="btn"
                onClick={() =>
                  speak(
                    answer.corrected ||
                      answer.reply,
                    answer.targetLanguage ||
                      target
                  )
                }
              >
                🔊 Repeat
              </button>
            </div>
          )}

          {answer.explanation && (
            <div>
              <b>Why</b>

              <p>
                {answer.explanation}
              </p>
            </div>
          )}

        </div>
      )}
    </section>
  );
}
