import { NextResponse } from "next/server";

const AI_PROVIDER_URL =
  process.env.AI_PROVIDER_URL ||
  "https://api.openai.com/v1/responses";

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

function safeResult(
  sourceLanguage,
  targetLanguage,
  path = "Learning Paths"
) {
  return {
    ok: true,
    mode: "practice",
    path,
    sourceLanguage,
    targetLanguage,
    reply: `GBK AI is ready to teach ${path} in ${targetLanguage}.`,
    translation: "",
    corrected: "",
    explanation:
      `Your language: ${sourceLanguage}. ` +
      `Learning language: ${targetLanguage}.`,
    pronunciation: "",
  };
}

function extractResponseText(providerJson) {
  if (typeof providerJson?.output_text === "string") {
    return providerJson.output_text.trim();
  }

  for (const item of Array.isArray(providerJson?.output)
    ? providerJson.output
    : []) {
    for (const part of Array.isArray(item?.content)
      ? item.content
      : []) {
      if (
        part?.type === "output_text" &&
        typeof part.text === "string"
      ) {
        return part.text.trim();
      }
    }
  }

  return "";
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

    const path =
      String(body?.path || "Learning Paths").trim() ||
      "Learning Paths";

    const lesson =
      String(body?.lesson || "").trim();

    const level =
      String(body?.level || "").trim();

    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please enter or speak something first.",
          sourceLanguage,
          targetLanguage,
          path,
        },
        { status: 400 }
      );
    }

    if (!AI_PROVIDER_API_KEY) {
      return NextResponse.json({
        ...safeResult(
          sourceLanguage,
          targetLanguage,
          path
        ),
        aiAvailable: false,
        providerError:
          "AI provider API key is not configured.",
      });
    }

    const instructions = `
You are GBK AI, a professional multilingual learning tutor.

PATH:
${path}

LEVEL:
${level || "Beginner"}

CURRENT LESSON:
${lesson || "General practice"}

SOURCE LANGUAGE:
${sourceLanguage}

TARGET LEARNING LANGUAGE:
${targetLanguage}

CORE RULES:

1. Teach specifically about the selected PATH and CURRENT LESSON.

2. Do not switch to a generic language lesson unless
   the learner explicitly asks for language-only practice.

3. The learner may ask questions in their SOURCE LANGUAGE.

4. The learner may use mixed languages.

5. Understand the learner's intended meaning.

6. Teach the subject in the TARGET LEARNING LANGUAGE.

7. Use the SOURCE LANGUAGE for clear explanations,
   corrections, grammar explanations, and learning guidance
   when helpful.

8. For lesson questions:
   - explain step by step
   - give a practical example
   - provide useful vocabulary/terms
   - give a short practice task

9. For language speaking practice:
   - understand the learner's intended meaning
   - provide a natural TARGET LANGUAGE sentence
   - correct grammar
   - correct word choice
   - correct sentence structure
   - provide simple pronunciation guidance

10. Support multilingual learning in both directions.

Examples:

Telugu -> English
Hindi -> English
English -> Japanese
Japanese -> English
Telugu -> Thai
Thai -> Japanese
Hindi -> Spanish
Arabic -> English
Chinese -> French
English -> Korean

11. Spoken English is a full learning path.

12. Other languages are also full learning paths.

13. Skill paths such as Digital Marketing, Coding,
    Business, Finance and AI should be taught as subjects,
    while the TARGET LANGUAGE controls the teaching language.

14. Always respect the selected PATH, LEVEL,
    CURRENT LESSON, SOURCE LANGUAGE and TARGET LANGUAGE.

Return ONLY valid JSON.

Use exactly these fields:

{
  "reply": "useful path-specific teaching answer in the target learning language",
  "translation": "target-language translation of the learner's sentence when relevant",
  "corrected": "natural corrected target-language sentence when relevant",
  "explanation": "clear explanation or correction in the source language",
  "pronunciation": "simple pronunciation guidance when relevant"
}

No markdown.
No code fences.
`;

    const providerResponse = await fetch(
      AI_PROVIDER_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${AI_PROVIDER_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_PROVIDER_MODEL,
          instructions,
          input: text,
          store: false,
        }),
        cache: "no-store",
      }
    );

    const providerText =
      await providerResponse.text();

    if (!providerResponse.ok) {
      console.error(
        "GBK AI provider error:",
        {
          status: providerResponse.status,
          body: providerText.slice(0, 2000),
        }
      );

      return NextResponse.json({
        ...safeResult(
          sourceLanguage,
          targetLanguage,
          path
        ),
        aiAvailable: false,
        providerError:
          `AI provider returned HTTP ${providerResponse.status}.`,
      });
    }

    let providerJson;

    try {
      providerJson = JSON.parse(providerText);
    } catch {
      return NextResponse.json({
        ...safeResult(
          sourceLanguage,
          targetLanguage,
          path
        ),
        aiAvailable: false,
        providerError:
          "Invalid response from AI provider.",
      });
    }

    const content =
      extractResponseText(providerJson);

    if (!content) {
      return NextResponse.json({
        ...safeResult(
          sourceLanguage,
          targetLanguage,
          path
        ),
        aiAvailable: false,
        providerError:
          "AI provider returned no text.",
      });
    }

    let result;

    try {
      result = JSON.parse(
        cleanJsonText(content)
      );
    } catch {
      return NextResponse.json({
        ok: true,
        mode: "practice",
        path,
        level,
        lesson,
        sourceLanguage,
        targetLanguage,
        reply: content,
        translation: "",
        corrected: "",
        explanation:
          `Your language: ${sourceLanguage}. ` +
          `Learning language: ${targetLanguage}.`,
        pronunciation: "",
        aiAvailable: true,
      });
    }

    return NextResponse.json({
      ok: true,
      mode: "practice",
      path,
      level,
      lesson,
      sourceLanguage,
      targetLanguage,
      reply: String(result?.reply || ""),
      translation: String(
        result?.translation || ""
      ),
      corrected: String(
        result?.corrected || ""
      ),
      explanation: String(
        result?.explanation || ""
      ),
      pronunciation: String(
        result?.pronunciation || ""
      ),
      aiAvailable: true,
    });
  } catch (error) {
    console.error(
      "GBK AI tutor route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "GBK AI tutor request failed.",
      },
      { status: 500 }
    );
  }
}
