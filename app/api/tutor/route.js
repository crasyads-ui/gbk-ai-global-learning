import { NextResponse } from "next/server";

const AI_PROVIDER_URL =
  process.env.AI_PROVIDER_URL ||
  "https://api.openai.com/v1/chat/completions";

const AI_PROVIDER_API_KEY = process.env.AI_PROVIDER_API_KEY;
const AI_PROVIDER_MODEL =
  process.env.AI_PROVIDER_MODEL || "gpt-5.6-luna";

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

function normalizeLanguage(value, fallback = "English") {
  const text = String(value || "").trim();

  return LANGUAGES.includes(text) ? text : fallback;
}

function cleanJsonText(text) {
  let value = String(text || "").trim();

  if (value.startsWith("```")) {
    value = value
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    value = value.slice(firstBrace, lastBrace + 1);
  }

  return value;
}

function safeResult(sourceLanguage, targetLanguage) {
  return {
    ok: true,
    mode: "practice",
    sourceLanguage,
    targetLanguage,
    reply: `GBK AI is ready to teach you in ${targetLanguage}.`,
    translation: "",
    corrected: "",
    explanation: `Your language: ${sourceLanguage}. Learning language: ${targetLanguage}.`,
    pronunciation: "",
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const text = String(body?.text || "").trim();

    const sourceLanguage = normalizeLanguage(
      body?.language,
      "English"
    );

    const targetLanguage = normalizeLanguage(
      body?.targetLanguage,
      "English"
    );

    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please enter or speak something first.",
          sourceLanguage,
          targetLanguage,
        },
        { status: 400 }
      );
    }

    if (!AI_PROVIDER_API_KEY) {
      console.error("GBK AI: AI_PROVIDER_API_KEY is missing");

      return NextResponse.json(
        {
          ...safeResult(sourceLanguage, targetLanguage),
          aiAvailable: false,
          providerError: "AI provider API key is not configured.",
        },
        { status: 200 }
      );
    }

    const systemPrompt = `
You are GBK AI, a multilingual AI tutor.

The learner's source/interface language is:
${sourceLanguage}

The learner wants to learn:
${targetLanguage}

IMPORTANT:
- The target language is authoritative.
- Teach the learner in the TARGET language.
- Explain corrections in the SOURCE language.
- Understand the learner's input even if it contains mixed languages.
- If the learner asks a question, answer it naturally.
- If the learner is practicing a sentence, provide a corrected natural sentence.
- Always provide useful pronunciation guidance when appropriate.
- Keep the answer practical and suitable for language learning.

Return ONLY valid JSON with exactly these fields:

{
  "reply": "natural answer or teaching response in the target language",
  "translation": "translation of the learner's sentence into the target language",
  "corrected": "correct natural target-language sentence",
  "explanation": "clear explanation in the source language",
  "pronunciation": "simple pronunciation guidance for the target sentence"
}

Do not use markdown.
Do not wrap the JSON in code fences.
`;

    const payload = {
      model: AI_PROVIDER_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    };

    const providerResponse = await fetch(AI_PROVIDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_PROVIDER_API_KEY}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const providerText = await providerResponse.text();

    if (!providerResponse.ok) {
      console.error("GBK AI provider error:", {
        status: providerResponse.status,
        body: providerText.slice(0, 2000),
      });

      return NextResponse.json(
        {
          ...safeResult(sourceLanguage, targetLanguage),
          aiAvailable: false,
          providerError: `AI provider returned HTTP ${providerResponse.status}.`,
        },
        { status: 200 }
      );
    }

    let providerJson;

    try {
      providerJson = JSON.parse(providerText);
    } catch {
      console.error("GBK AI invalid provider JSON:", providerText.slice(0, 2000));

      return NextResponse.json(
        {
          ...safeResult(sourceLanguage, targetLanguage),
          aiAvailable: false,
          providerError: "Invalid response from AI provider.",
        },
        { status: 200 }
      );
    }

    const content =
      providerJson?.choices?.[0]?.message?.content || "";

    if (!content) {
      console.error("GBK AI empty model response:", providerJson);

      return NextResponse.json(
        {
          ...safeResult(sourceLanguage, targetLanguage),
          aiAvailable: false,
          providerError: "AI provider returned an empty response.",
        },
        { status: 200 }
      );
    }

    let result;

    try {
      result = JSON.parse(cleanJsonText(content));
    } catch {
      console.error("GBK AI model returned non-JSON:", content.slice(0, 2000));

      return NextResponse.json(
        {
          ok: true,
          mode: "practice",
          sourceLanguage,
          targetLanguage,
          reply: content,
          translation: "",
          corrected: "",
          explanation:
            `Your language: ${sourceLanguage}. Learning language: ${targetLanguage}.`,
          pronunciation: "",
          aiAvailable: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "practice",
      sourceLanguage,
      targetLanguage,
      reply: String(result?.reply || ""),
      translation: String(result?.translation || ""),
      corrected: String(result?.corrected || ""),
      explanation: String(result?.explanation || ""),
      pronunciation: String(result?.pronunciation || ""),
      aiAvailable: true,
    });
  } catch (error) {
    console.error("GBK AI tutor route error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "GBK AI tutor request failed.",
      },
      { status: 500 }
    );
  }
}
