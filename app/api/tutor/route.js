const corrections = [
  [
    /\bi am agree\b/i,
    "I agree",
    "Use the verb agree directly after I."
  ],
  [
    /\bmyself ([A-Za-z]+)/i,
    "I am $1",
    "Use I am + name when introducing yourself."
  ],
  [
    /\bi have went\b/i,
    "I have gone",
    "Use the past participle gone after have."
  ],
  [
    /\bhe go\b/i,
    "he goes",
    "Use goes with he/she/it in the present simple."
  ],
  [
    /\bshe go\b/i,
    "she goes",
    "Use goes with he/she/it in the present simple."
  ]
];

const greetings = {
  "తెలుగు":
    "నమస్కారం! నేను GBK AI. మీ మాటలను అర్థం చేసుకుని నేర్చుకోవడంలో సహాయం చేస్తాను.",
  "हिन्दी":
    "नमस्कार! मैं GBK AI हूँ। मैं आपकी भाषा में समझाकर सीखने में मदद कर सकता हूँ.",
  "தமிழ்":
    "வணக்கம்! நான் GBK AI. உங்கள் மொழியில் விளக்கி கற்றுக்கொள்ள உதவுகிறேன்.",
  "ಕನ್ನಡ":
    "ನಮಸ್ಕಾರ! ನಾನು GBK AI. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ ಕಲಿಯಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
  "മലയാളം":
    "നമസ്കാരം! ഞാൻ GBK AI. നിങ്ങളുടെ ഭാഷയിൽ വിശദീകരിച്ച് പഠിക്കാൻ സഹായിക്കും.",
  "Español":
    "¡Hola! Soy GBK AI. Puedo explicar y practicar contigo en tu idioma.",
  "Français":
    "Bonjour! Je suis GBK AI. Je peux expliquer et pratiquer avec vous dans votre langue.",
  "Deutsch":
    "Hallo! Ich bin GBK AI. Ich kann in Ihrer Sprache erklären und mit Ihnen üben."
};

function local(text, language, targetLanguage) {
  for (const [re, corrected, explanation] of corrections) {
    if (re.test(text)) {
      return {
        reply: corrected,
        original: text,
        corrected,
        translation: corrected,
        explanation,
        sourceLanguage: language,
        targetLanguage: "English",
        mode: "local"
      };
    }
  }

  return {
    reply:
      greetings[language] ||
      "I understand. Let's learn this step by step.",
    original: text,
    corrected: "",
    translation: "",
    explanation:
      `Local practice mode is active. ${language} → ${targetLanguage} translation requires the production AI provider.`,
    sourceLanguage: language,
    targetLanguage,
    mode: "local"
  };
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "gbk-ai-global-learning",
    version: "12.0.0",
    tutorApi: true,
    voiceCoach: true,
    pwa: true,
    productionAIConfigured:
      Boolean(process.env.AI_PROVIDER_API_KEY)
  });
}

export async function POST(req) {
  try {
    const body = await req.json();

    const text = String(body.text || "").trim();
    const language = body.language || "English";

    const targetLanguage =
      body.targetLanguage ||
      (language === "English" ? "Telugu" : "English");

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
        const response = await fetch(
          process.env.AI_PROVIDER_URL,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization:
                `Bearer ${process.env.AI_PROVIDER_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-5.6-luna",
              messages: [
                {
                  role: "system",
                  content: `
You are GBK AI, a patient multilingual tutor.

Source language: ${language}
Target language: ${targetLanguage}

The user may write or speak in the source language.

Your job:
1. Understand the user's sentence.
2. Translate it into the target language.
3. Correct grammar, word choice and sentence structure.
4. Provide a natural corrected sentence.
5. Explain the correction simply.
6. Help the learner practice speaking.

Return ONLY valid JSON with these fields:

{
  "reply": "...",
  "translation": "...",
  "corrected": "...",
  "explanation": "...",
  "sourceLanguage": "${language}",
  "targetLanguage": "${targetLanguage}"
}

Important:
- Always provide translation.
- Always preserve the user's intended meaning.
- If source is Telugu and target is English, translate Telugu → English.
- If source is English and target is Telugu, translate English → Telugu.
- Do not claim precise pronunciation scoring unless supported.
`
                },
                {
                  role: "user",
                  content: text
                }
              ]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();

          const content =
            data.choices?.[0]?.message?.content ||
            data.output_text ||
            "";

          try {
            return Response.json({
              ...JSON.parse(content),
              original: text,
              sourceLanguage: language,
              targetLanguage,
              mode: "ai"
            });
          } catch {
            return Response.json({
              reply: content,
              translation: content,
              corrected: "",
              explanation: "",
              original: text,
              sourceLanguage: language,
              targetLanguage,
              mode: "ai"
            });
          }
        }
      } catch (error) {
        console.error("AI provider error:", error);
      }
    }

    return Response.json(
      local(text, language, targetLanguage)
    );
  } catch (error) {
    console.error("Tutor API error:", error);

    return Response.json({
      reply: "I can still help with practice. Please try again.",
      translation: "",
      corrected: "",
      explanation: "",
      mode: "local"
    });
  }
}
