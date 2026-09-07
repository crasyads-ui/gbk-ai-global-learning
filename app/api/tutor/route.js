const corrections = [
  [/\bi am agree\b/i, "I agree", "Use the verb agree directly after I."],
  [/\bmyself ([A-Za-z]+)/i, "I am $1", "Use I am + name when introducing yourself."],
  [/\bi have went\b/i, "I have gone", "Use the past participle gone after have."],
  [/\bhe go\b/i, "he goes", "Use goes with he/she/it in the present simple."],
  [/\bshe go\b/i, "she goes", "Use goes with he/she/it in the present simple."]
];

const greetings = {
  "తెలుగు": "నమస్కారం! నేను GBK AI. మీ భాషలో అర్థం చేసుకుని నేర్చుకోవడంలో సహాయం చేస్తాను.",
  "हिन्दी": "नमस्कार! मैं GBK AI हूँ। मैं आपकी भाषा में समझाकर सीखने में मदद कर सकता हूँ।",
  "தமிழ்": "வணக்கம்! நான் GBK AI. உங்கள் மொழியில் விளக்கி கற்றுக்கொள்ள உதவுகிறேன்.",
  "ಕನ್ನಡ": "ನಮಸ್ಕಾರ! ನಾನು GBK AI. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ ಕಲಿಯಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
  "മലയാളം": "നമസ്കാരം! ഞാൻ GBK AI. നിങ്ങളുടെ ഭാഷയിൽ വിശദീകരിച്ച് പഠിക്കാൻ സഹായിക്കും.",
  "Español": "¡Hola! Soy GBK AI. Puedo explicar y practicar contigo en tu idioma.",
  "Français": "Bonjour ! Je suis GBK AI. Je peux expliquer et pratiquer avec vous dans votre langue.",
  "Deutsch": "Hallo! Ich bin GBK AI. Ich kann in Ihrer Sprache erklären und mit Ihnen üben."
};

function local(text, language, targetLanguage) {
  for (const [re, corrected, explanation] of corrections) {
    if (re.test(text)) {
      return {
        reply: corrected,
        original: text,
        corrected,
        explanation,
        translation: corrected,
        targetLanguage,
        mode: "local"
      };
    }
  }

  return {
    reply:
      `I understand. I will help you learn ${targetLanguage} using ${language}.`,
    original: text,
    corrected: "",
    translation: "",
    explanation:
      `Local practice mode is active. The selected learning language is ${targetLanguage}.`,
    targetLanguage,
    mode: "local"
  };
}

function extractJson(content) {
  const text = String(content || "").trim();

  try {
    return JSON.parse(text);
  } catch {}

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  return null;
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "gbk-ai-global-learning",
    version: "13.0.0",
    tutorApi: true,
    voiceCoach: true,
    pwa: true,
    multilingualTargetLanguage: true,
    productionAIConfigured:
      Boolean(process.env.AI_PROVIDER_API_KEY)
  });
}

export async function POST(req) {
  try {
    const body = await req.json();

    const text = String(body.text || "").trim();
    const language = String(
      body.language || "English"
    );
    const targetLanguage = String(
      body.targetLanguage || "English"
    );
    const path = String(
      body.path || "AI Tutor"
    );

    if (!text) {
      return Response.json(
        {
          ok: false,
          error: "Text is required"
        },
        { status: 400 }
      );
    }

    if (
      process.env.AI_PROVIDER_API_KEY &&
      process.env.AI_PROVIDER_URL
    ) {
      try {
        const isResponsesApi =
          process.env.AI_PROVIDER_URL.includes(
            "/responses"
          );

        const systemPrompt = `
You are GBK AI, a patient global AI tutor.

User language: ${language}
Target learning language: ${targetLanguage}
Learning path: ${path}

The user may be learning:
- languages
- spoken communication
- AI
- technology
- coding
- business
- finance
- marketing
- education
- careers
- real-life skills

Your job is to teach clearly and practically.

IMPORTANT:
1. Understand the user's language.
2. Teach in the selected target language.
3. Explain difficult points in the user's language when useful.
4. For language learning, provide a natural target-language sentence.
5. Correct grammar, vocabulary and sentence structure.
6. For coding, explain code simply and provide correct examples when requested.
7. For AI/technology, explain concepts step by step.
8. Do not claim precise pronunciation scoring unless actual pronunciation analysis is available.
9. Keep answers useful and concise for a learner.

Return JSON only with these fields:

{
  "reply": "main answer or correction",
  "translation": "useful sentence/content in target language",
  "corrected": "corrected version when applicable",
  "explanation": "explanation for the learner",
  "targetLanguage": "${targetLanguage}"
}
`;

        let requestBody;

        if (isResponsesApi) {
          requestBody = {
            model: "gpt-5.6-luna",
            instructions: systemPrompt,
            input: text
          };
        } else {
          requestBody = {
            model: "gpt-5.6-luna",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: text
              }
            ]
          };
        }

        const r = await fetch(
          process.env.AI_PROVIDER_URL,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization:
                `Bearer ${process.env.AI_PROVIDER_API_KEY}`
            },
            body: JSON.stringify(requestBody)
          }
        );

        if (r.ok) {
          const d = await r.json();

          const content =
            d.choices?.[0]?.message?.content ||
            d.output_text ||
            "";

          const parsed = extractJson(content);

          if (parsed) {
            return Response.json({
              ...parsed,
              original: text,
              targetLanguage,
              mode: "ai"
            });
          }

          return Response.json({
            reply: content,
            original: text,
            corrected: "",
            translation: "",
            explanation: "",
            targetLanguage,
            mode: "ai"
          });
        }

        console.error(
          "GBK AI provider error:",
          r.status
        );
      } catch (error) {
        console.error(
          "GBK AI request error:",
          error
        );
      }
    }

    return Response.json(
      local(
        text,
        language,
        targetLanguage
      )
    );
  } catch (error) {
    console.error(
      "GBK AI tutor route error:",
      error
    );

    return Response.json({
      reply:
        "I can still help you practice. Please try again.",
      mode: "local"
    });
  }
}
