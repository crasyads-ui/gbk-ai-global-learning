"use client";

import { useEffect, useRef, useState } from "react";
import { langCodes } from "../lib/languages";

const LANGUAGE_ALIASES = {
  english: "English",
  telugu: "తెలుగు",
  hindi: "हिन्दी",
  marathi: "मराठी",
  bengali: "বাংলা",
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
};

const LANGUAGE_PATTERNS = [
  ["English", ["english", "inglês", "ingles", "angličtina"]],
  ["తెలుగు", ["telugu", "తెలుగు"]],
  ["हिन्दी", ["hindi", "हिन्दी", "हिंदी"]],
  ["मराठी", ["marathi", "मराठी"]],
  ["বাংলা", ["bengali", "bangla", "বাংলা"]],
  ["தமிழ்", ["tamil", "தமிழ்"]],
  ["ಕನ್ನಡ", ["kannada", "ಕನ್ನಡ"]],
  ["മലയാളം", ["malayalam", "മലയാളം"]],
  ["ગુજરાતી", ["gujarati", "ગુજરાતી"]],
  ["ਪੰਜਾਬੀ", ["punjabi", "ਪੰਜਾਬੀ"]],
  ["اردو", ["urdu", "اردو"]],
  ["Español", ["spanish", "español", "espanol"]],
  ["Français", ["french", "français", "francais"]],
  ["Deutsch", ["german", "deutsch"]],
  ["Português", ["portuguese", "português", "portugues"]],
  ["Italiano", ["italian", "italiano"]],
  ["العربية", ["arabic", "العربية"]],
  ["Türkçe", ["turkish", "türkçe", "turkce"]],
  ["Русский", ["russian", "русский"]],
  ["Bahasa Indonesia", ["indonesian", "bahasa indonesia"]],
  ["Tiếng Việt", ["vietnamese", "tiếng việt", "tieng viet"]],
  ["ไทย", ["thai", "ไทย"]],
  ["日本語", ["japanese", "日本語"]],
  ["한국어", ["korean", "한국어"]],
  ["中文", ["chinese", "中文", "mandarin"]],
];

function detectLanguage(text, fallback = "English") {
  const value = String(text || "");

  const scripts = [
    [/[0C00-0C7F]/, "తెలుగు"],
    [/[0900-097F]/, "हिन्दी"],
    [/[0B80-0BFF]/, "தமிழ்"],
    [/[0C80-0CFF]/, "ಕನ್ನಡ"],
    [/[0D00-0D7F]/, "മലയാളം"],
    [/[0980-09FF]/, "বাংলা"],
    [/[0A80-0AFF]/, "ગુજરાતી"],
    [/[0A00-0A7F]/, "ਪੰਜਾਬੀ"],
    [/[0600-06FF]/, "العربية"],
    [/[3040-30FF]/, "日本語"],
    [/[AC00-D7AF]/, "한국어"],
    [/[0E00-0E7F]/, "ไทย"],
    [/[4E00-9FFF]/, "中文"],
    [/[0400-04FF]/, "Русский"],
  ];

  for (const [regex, language] of scripts) {
    if (regex.test(value)) return language;
  }

  const lower = value.toLowerCase();

  for (const [language, patterns] of LANGUAGE_PATTERNS) {
    if (patterns.some((pattern) => lower.includes(pattern))) {
      return language;
    }
  }

  return fallback;
}

function detectRequestedLanguage(text) {
  const value = String(text || "").toLowerCase();

  for (const [language, patterns] of LANGUAGE_PATTERNS) {
    for (const pattern of patterns) {
      const requests = [
        `in ${pattern}`,
        `into ${pattern}`,
        `to ${pattern}`,
        `learn ${pattern}`,
        `speak ${pattern}`,
        `practice ${pattern}`,
        `teach me ${pattern}`,
        `teach ${pattern}`,
        `conversation in ${pattern}`,
        `conversation ${pattern}`,
      ];

      if (requests.some((request) => value.includes(request))) {
        return language;
      }
    }
  }

  return "auto";
}

function getVoiceLanguage(language) {
  return langCodes[language] || "en-US";
}

export default function VoiceCoach() {
  const [language, setLanguage] = useState("English");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [learningLanguage, setLearningLanguage] = useState("");

  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(
        localStorage.getItem("gbk_language") || "English"
      );
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
  }, []);

  function speak(text, speakLanguage = "English") {
    if (!text || typeof window === "undefined") return;

    window.speechSynthesis?.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = getVoiceLanguage(speakLanguage);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis?.speak(utterance);
  }

  async function askGBK(text = heard) {
    const value = String(text || "").trim();

    if (!value || busy) return;

    setBusy(true);
    setStatus("Thinking…");
    setAnswer(null);

    const source = detectLanguage(value, language);
    const requested = detectRequestedLanguage(value);

    setDetectedLanguage(source);

    if (requested !== "auto") {
      setLearningLanguage(requested);
    } else {
      setLearningLanguage("");
    }

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: value,
          language: source,
          targetLanguage: requested,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Tutor request failed"
        );
      }

      const finalSource =
        data?.sourceLanguage || source;

      const finalTarget =
        data?.targetLanguage &&
        data.targetLanguage !== "auto"
          ? data.targetLanguage
          : requested !== "auto"
          ? requested
          : "";

      setDetectedLanguage(finalSource);

      if (finalTarget) {
        setLearningLanguage(finalTarget);
      }

      const result = {
        ...data,
        original: data?.original || value,
        sourceLanguage: finalSource,
        targetLanguage: finalTarget || "auto",
      };

      setAnswer(result);

      setStatus(
        data?.mode === "ai"
          ? "GBK AI coach ready"
          : "GBK AI practice mode"
      );

      const voiceText =
        data?.corrected ||
        data?.translation ||
        data?.reply ||
        "";

      if (voiceText) {
        speak(
          voiceText,
          finalTarget || "English"
        );
      }
    } catch (error) {
      console.error(
        "GBK AI tutor error:",
        error
      );

      setAnswer({
        original: value,
        sourceLanguage: source,
        targetLanguage:
          requested !== "auto"
            ? requested
            : "auto",
        translation: "",
        corrected: "",
        reply:
          "I could not process that right now. Please try again.",
        explanation:
          "The GBK AI connection could not be completed.",
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
      setStatus(
        "Voice recognition is not supported. Please use Chrome."
      );
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognition.lang =
      getVoiceLanguage(language);

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

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      setListening(false);
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();

    setListening(false);
    setStatus("Stopped");

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }

  function getTargetLanguage() {
    if (
      answer?.targetLanguage &&
      answer.targetLanguage !== "auto"
    ) {
      return answer.targetLanguage;
    }

    if (learningLanguage) {
      return learningLanguage;
    }

    return "English";
  }

  function getLearningSentence() {
    return (
      answer?.translation ||
      answer?.corrected ||
      answer?.reply ||
      ""
    );
  }

  function listenToSentence() {
    const sentence = getLearningSentence();

    if (!sentence) return;

    speak(
      sentence,
      getTargetLanguage()
    );
  }

  function repeatCorrection() {
    const sentence =
      answer?.corrected ||
      answer?.translation ||
      answer?.reply ||
      "";

    if (!sentence) return;

    speak(
      sentence,
      getTargetLanguage()
    );
  }

  function practiceAgain() {
    setHeard("");
    setAnswer(null);
    setDetectedLanguage("");
    setLearningLanguage("");
    setStatus("");

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
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
          <span className="badge">
            🎙️ Voice Coach
          </span>

          <h2>Talk to GBK AI</h2>

          <p>
            Listen, speak, translate, get corrected,
            repeat and improve.
          </p>
        </div>

        <div
          className={
            listening
              ? "mic live"
              : "mic"
          }
        >
          {listening ? "🔴" : "🎙️"}
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
          onClick={() => askGBK()}
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

      <div className="coachSteps">

        <div className="coachStep">
          <div className="stepNumber">1</div>

          <div className="stepContent">
            <h3>🎧 Listen</h3>

            <p>
              Listen to the translated or
              corrected sentence.
            </p>

            <button
              className="btn"
              onClick={listenToSentence}
              disabled={!answer}
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
              disabled={
                listening || busy
              }
            >
              🎙️{" "}
              {listening
                ? "Listening…"
                : "Speak"}
            </button>
          </div>
        </div>

        <div className="coachStep">
          <div className="stepNumber">3</div>

          <div className="stepContent">
            <h3>
              ✨ GBK AI Correction
            </h3>

            <p>
              GBK AI detects the spoken language
              and requested learning language.
            </p>

            {answer ? (
              <div className="coachResult">

                <strong>
                  You said
                </strong>

                <p>
                  {answer.original || heard}
                </p>

                <strong>
                  🌐 Detected language
                </strong>

                <p>
                  {answer.sourceLanguage ||
                    detectedLanguage ||
                    language}
                </p>

                {(
                  answer.targetLanguage &&
                  answer.targetLanguage !== "auto"
                ) ||
                learningLanguage ? (
                  <>
                    <strong>
                      🎯 Learning language
                    </strong>

                    <p>
                      {answer.targetLanguage &&
                      answer.targetLanguage !== "auto"
                        ? answer.targetLanguage
                        : learningLanguage}
                    </p>
                  </>
                ) : null}

                {answer.translation && (
                  <>
                    <strong>
                      🌐 Translation
                    </strong>

                    <p>
                      {answer.translation}
                    </p>
                  </>
                )}

                <strong>
                  ✨ GBK AI correction / answer
                </strong>

                <p>
                  {answer.corrected ||
                    answer.reply ||
                    "No correction needed."}
                </p>

                {answer.explanation && (
                  <>
                    <strong>
                      Why
                    </strong>

                    <p>
                      {answer.explanation}
                    </p>
                  </>
                )}

              </div>
            ) : (
              <div className="coachResult">
                Your detected language,
                learning language,
                translation and GBK AI
                correction will appear here.
              </div>
            )}
          </div>
        </div>

        <div className="coachStep">
          <div className="stepNumber">4</div>

          <div className="stepContent">
            <h3>🔊 Repeat</h3>

            <p>
              Listen to the corrected sentence
              and repeat it aloud.
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
            <h3>
              🔄 Practice Again / Improve
            </h3>

            <p>
              Try again and improve your speaking.
            </p>

            <button
              className="btn primary"
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
