import { NextResponse } from "next/server";

const DEFAULT_TARGET = "English";

const SUPPORTED_LANGUAGES = [
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

function normalizeLanguage(value, fallback = DEFAULT_TARGET) {
  const language = String(value || "").trim();

  if (SUPPORTED_LANGUAGES.includes(language)) {
    return language;
  }

  return fallback;
}

function fallbackResponse(text, sourceLanguage, targetLanguage) {
  const sentence = String(text || "").trim();

  return {
    ok: true,
    mode: "practice",
    sourceLanguage,
    targetLanguage,
    reply:
      `I understood your message. Let's learn ${targetLanguage} step by step.`,
    translation: sentence,
    corrected: "",
    explanation:
      `Your language is ${sourceLanguage}. You are learning ${targetLanguage}. Ask GBK AI for a sentence, translation, pronunciation practice, or correction.`,
  };
}

function extractJSON(content) {
  if (!content) return null;

  if (typeof content === "object") {
    return content;
  }

  const text = String(content).trim();

  try {
    return JSON.parse(text);
  } catch {}

  const fenced = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(fenced);
  } catch {}

  const first = fenced.indexOf("{");
  const last = fenced.lastIndexOf("}");

  if (first >= 0 && last > first) {
    try {
      return JSON.parse(fenced.slice(first, last + 1));
    } catch {}
  }

  return null;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "GBK AI Global Learning Tutor",
    version: "13.0.0",
    multilingual: true,
    supportedLanguages: SUPPORTED_LANGUAGES.length,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const text = String(
      body?.text ?? body?.message ?? ""
    ).trim();

    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          error: "Text is required.",
        },
        { status: 400 }
      );
    }

    const sourceLanguage = normalizeLanguage(
      body?.language,
      "English"
    );

    const targetLanguage = normalizeLanguage(
      body?.targetLanguage,
      DEFAULT_TARGET
    );

    const apiKey = process.env.AI_PROVIDER_API_KEY;
    const providerUrl =
      process.env.AI_PROVIDER_URL ||
      "https://api.openai.com/v1/chat/completions";

    const model =
      process.env.AI_PROVIDER_MODEL ||
      "gpt-5.6-luna";

    if (!apiKey) {
      return NextResponse.json(
        fallbackResponse(
          text,
          sourceLanguage,
          targetLanguage
        )
      );
    }

    const systemPrompt = `
You are GBK AI Global Learning, a multilingual AI tutor.

The learner's source/own language is:
${sourceLanguage}

The learner's selected target language is:
${targetLanguage}

IMPORTANT:
- NEVER assume English is the target language.
- ALWAYS teach the selected target language.
- ${targetLanguage} is the authoritative learning language.
- Explain corrections and teaching points in the learner's source language: ${sourceLanguage}.
- The actual sentence being learned must be written in ${targetLanguage}.
- If the learner asks to learn a language, immediately provide a useful beginner sentence in the selected target language.
- If the learner provides a sentence in their own language, translate its meaning into ${targetLanguage}.
- If the learner provides a sentence already written in ${targetLanguage}, check grammar, naturalness, word choice and sentence structure.
- Give a short, practical explanation.
- Include pronunciation guidance when useful.
- Keep the response beginner-friendly.
- Do not unnecessarily translate the explanation into English.
- Do not change the selected target language.

Example:
Source language: Hindi
Target language: Thai

User:
"मुझे थाई भाषा में बातचीत करना सिखाओ।"

Return a useful Thai beginner sentence, explain it in Hindi, and provide pronunciation help.

Return ONLY valid JSON with exactly these fields:

{
  "reply": "short helpful response in the source language",
  "translation": "target-language sentence",
  "corrected": "best/correct target-language sentence",
  "explanation": "short explanation in the source language",
  "pronunciation": "simple pronunciation guidance when useful",
  "sourceLanguage": "${sourceLanguage}",
  "targetLanguage": "${targetLanguage}"
}
`;

    const providerResponse = await fetch(providerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
        response_format: {
          type: "json_object",
        },
      }),
    });

    if (!providerResponse.ok) {
      console.error(
        "AI provider error:",
        providerResponse.status,
        await providerResponse.text()
      );

      return NextResponse.json(
        fallbackResponse(
          text,
          sourceLanguage,
          targetLanguage
        )
      );
    }

    const providerData = await providerResponse.json();

    const content =
      providerData?.choices?.[0]?.message?.content ||
      "";

    const parsed = extractJSON(content);

    if (!parsed) {
      return NextResponse.json(
        fallbackResponse(
          text,
          sourceLanguage,
          targetLanguage
        )
      );
    }

    const result = {
      ok: true,
      mode: "ai",
      sourceLanguage:
        parsed.sourceLanguage || sourceLanguage,
      targetLanguage:
        parsed.targetLanguage || targetLanguage,
      reply:
        parsed.reply ||
        `Let's learn ${targetLanguage} step by step.`,
      translation:
        parsed.translation || "",
      corrected:
        parsed.corrected || "",
      explanation:
        parsed.explanation ||
        `This explanation is provided in ${sourceLanguage}.`,
      pronunciation:
        parsed.pronunciation || "",
    };

    /*
     * Safety check:
     * The frontend must never accidentally switch the
     * selected learning language because the AI returned
     * something else.
     */
    result.targetLanguage = targetLanguage;

    return NextResponse.json(result);
  } catch (error) {
    console.error("GBK AI tutor error:", error);

    return NextResponse.json({
      ...fallbackResponse(
        "",
        "English",
        DEFAULT_TARGET
      ),
      ok: true,
      mode: "practice",
    });
  }
}
