import { NextResponse } from "next/server";

const DEFAULT_LANGUAGE = "English";

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

function normalizeLanguage(value, fallback = DEFAULT_LANGUAGE) {
  const valueText = String(value || "").trim();

  return LANGUAGES.includes(valueText)
    ? valueText
    : fallback;
}

function localFallback(text, sourceLanguage, targetLanguage) {
  return {
    ok: true,
    mode: "practice",
    sourceLanguage,
    targetLanguage,
    reply:
      `GBK AI understood you. You are learning ${targetLanguage}.`,
    translation: "",
    corrected: "",
    explanation:
      `Your language: ${sourceLanguage}. Learning language: ${targetLanguage}.`,
    pronunciation: "",
  };
}

function parseAIJSON(content) {
  if (!content) return null;

  if (typeof content === "object") {
    return content;
  }

  let text = String(content).trim();

  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch {}

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
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
    languages: LANGUAGES,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const text = String(
      body?.text ??
      body?.message ??
      ""
    ).trim();

    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please speak or type something first.",
        },
        { status: 400 }
      );
    }

    const sourceLanguage = normalizeLanguage(
      body?.language,
      DEFAULT_LANGUAGE
    );

    const targetLanguage = normalizeLanguage(
      body?.targetLanguage,
      DEFAULT_LANGUAGE
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
        localFallback(
          text,
          sourceLanguage,
          targetLanguage
        )
      );
    }

    const systemPrompt = `
You are GBK AI Global Learning.

You are a multilingual language-learning coach.

SOURCE / OWN LANGUAGE:
${sourceLanguage}

TARGET / LEARNING LANGUAGE:
${targetLanguage}

The target language is selected by the learner and is AUTHORITATIVE.

NEVER automatically change the target language to English.

Your job:

1. Understand what the learner said.
2. Detect the meaning and learning intention.
3. Teach the learner in ${targetLanguage}.
4. Explain the lesson and corrections in ${sourceLanguage}.
5. Give a natural sentence in ${targetLanguage}.
6. If the learner already attempted ${targetLanguage}, correct grammar,
   vocabulary, sentence structure and naturalness.
7. Give simple pronunciation guidance when useful.
8. Keep explanations short and beginner-friendly.
9. Encourage the learner to repeat the target sentence.
10. The final learning sentence must be in ${targetLanguage}.

IMPORTANT MULTILINGUAL EXAMPLE:

Source:
Hindi

Target:
Thai

User:
"मुझे थाई भाषा में बातचीत करना सिखाओ।"

Your response should teach a useful Thai conversation sentence,
while explaining it in Hindi.

ANOTHER EXAMPLE:

Source:
Telugu

Target:
Japanese

User:
"నాకు జపనీస్ నేర్చుకోవాలి."

Provide:
- Japanese learning sentence
- explanation in Telugu
- Japanese pronunciation guidance
- correction if necessary

ANOTHER EXAMPLE:

Source:
Japanese

Target:
Thai

Provide Thai learning material and explain it in Japanese.

Return ONLY valid JSON:

{
  "reply": "short helpful explanation in ${sourceLanguage}",
  "translation": "useful sentence in ${targetLanguage}",
  "corrected": "best natural sentence in ${targetLanguage}",
  "explanation": "why/how to use it explained in ${sourceLanguage}",
  "pronunciation": "simple pronunciation guidance for ${targetLanguage}",
  "sourceLanguage": "${sourceLanguage}",
  "targetLanguage": "${targetLanguage}"
}

Do not return Markdown.
Do not return code fences.
Do not return English explanations unless English is the source language.
Do not change ${targetLanguage} to another language.
`;

    const aiResponse = await fetch(providerUrl, {
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      console.error(
        "GBK AI provider error:",
        aiResponse.status,
        errorText
      );

      return NextResponse.json(
        localFallback(
          text,
          sourceLanguage,
          targetLanguage
        )
      );
    }

    const providerData = await aiResponse.json();

    const content =
      providerData?.choices?.[0]?.message?.content || "";

    const parsed = parseAIJSON(content);

    if (!parsed) {
      console.error(
        "GBK AI returned invalid JSON:",
        content
      );

      return NextResponse.json(
        localFallback(
          text,
          sourceLanguage,
          targetLanguage
        )
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "ai",

      sourceLanguage,

      // IMPORTANT:
      // Always preserve the learner's selected target.
      targetLanguage,

      reply:
        parsed.reply ||
        `Let's learn ${targetLanguage} step by step.`,

      translation:
        parsed.translation || "",

      corrected:
        parsed.corrected || "",

      explanation:
        parsed.explanation ||
        `This lesson is explained in ${sourceLanguage}.`,

      pronunciation:
        parsed.pronunciation || "",
    });

  } catch (error) {
    console.error(
      "GBK AI tutor route error:",
      error
    );

    return NextResponse.json(
      localFallback(
        "",
        DEFAULT_LANGUAGE,
        DEFAULT_LANGUAGE
      )
    );
  }
}
