"use client";

import { useEffect, useMemo, useState } from "react";
import VoiceCoach from "../components/VoiceCoach";

const CURRICULUMS = {
  "Spoken English": {
    Beginner: [
      ["English Foundations", "Build basic everyday English sentences."],
      ["Introducing Yourself", "Introduce yourself clearly and naturally."],
      ["Daily Conversations", "Practice useful everyday conversations."],
      ["Questions & Answers", "Ask and answer common questions."],
      ["Pronunciation Basics", "Improve sounds, stress and clarity."],
      ["Grammar Essentials", "Learn the most useful English grammar."],
      ["Workplace English", "Speak confidently in common work situations."],
      ["Real-Life Roleplay", "Practice practical conversations with GBK AI."],
      ["Conversation Practice", "Build confidence through guided speaking."],
      ["English Project", "Complete your first practical English speaking project."]
    ],
    Intermediate: [
      ["Fluent Conversations", "Speak naturally in longer conversations."],
      ["Advanced Grammar", "Improve accuracy and sentence structure."],
      ["Vocabulary Building", "Use stronger and more natural vocabulary."],
      ["Work & Business English", "Communicate professionally."],
      ["Presentation Skills", "Present ideas clearly in English."],
      ["Interview English", "Practice realistic interview questions."],
      ["Storytelling", "Tell stories naturally and confidently."],
      ["Debate & Discussion", "Express and defend your ideas."],
      ["Advanced Speaking Practice", "Improve fluency and confidence."],
      ["English Mastery Project", "Complete an advanced speaking project."]
    ],
    Advanced: [
      ["Advanced Fluency", "Develop natural, flexible communication."],
      ["Professional Communication", "Communicate effectively in professional settings."],
      ["Negotiation English", "Practice persuasive and strategic communication."],
      ["Public Speaking", "Deliver confident presentations and speeches."],
      ["Advanced Pronunciation", "Refine rhythm, stress and pronunciation."],
      ["Idioms & Natural English", "Understand and use natural expressions."],
      ["Leadership Communication", "Communicate as a leader."],
      ["Global Communication", "Handle international conversations."],
      ["Expert Conversation", "Practice high-level discussion."],
      ["English Mastery", "Complete the advanced English program."]
    ]
  },

  "Digital Marketing": {
    Beginner: [
      ["What is Digital Marketing?", "Understand digital marketing and its major channels."],
      ["Customer & Audience", "Learn how to understand your target audience."],
      ["Marketing Funnel", "Understand awareness, consideration and conversion."],
      ["Branding", "Learn the fundamentals of building a brand."],
      ["Content Basics", "Create useful content for your audience."],
      ["Social Media Basics", "Understand major social media marketing channels."],
      ["SEO Basics", "Learn how search engines and SEO work."],
      ["Email Marketing", "Understand email campaigns and customer communication."],
      ["Analytics Basics", "Learn the basics of marketing measurement."],
      ["First Marketing Project", "Create your first practical marketing campaign."]
    ],
    Intermediate: [
      ["Content Strategy", "Build a structured content strategy."],
      ["SEO Strategy", "Develop practical search optimization strategies."],
      ["Social Media Strategy", "Create platform-specific campaigns."],
      ["Paid Advertising", "Understand paid digital advertising."],
      ["Email Campaigns", "Build effective email campaigns."],
      ["Conversion Optimization", "Improve landing pages and conversions."],
      ["Marketing Analytics", "Read and use campaign data."],
      ["Customer Retention", "Build strategies for returning customers."],
      ["Marketing Automation", "Understand automated marketing workflows."],
      ["Marketing Growth Project", "Build a complete growth campaign."]
    ],
    Advanced: [
      ["Growth Marketing", "Design scalable growth systems."],
      ["Advanced SEO", "Develop advanced search strategies."],
      ["Performance Marketing", "Optimize campaigns for measurable results."],
      ["Advanced Analytics", "Use data to make marketing decisions."],
      ["Customer Acquisition", "Build efficient acquisition systems."],
      ["Lifecycle Marketing", "Design customer lifecycle strategies."],
      ["Marketing Automation", "Build sophisticated automation workflows."],
      ["Global Marketing", "Plan campaigns for international markets."],
      ["Marketing Leadership", "Lead marketing strategy and execution."],
      ["Advanced Marketing Project", "Complete a professional marketing project."]
    ]
  },

  "AI & Technology": {
    Beginner: [
      ["Introduction to AI", "Understand artificial intelligence."],
      ["How AI Works", "Learn the basic ideas behind modern AI."],
      ["Generative AI", "Understand AI that creates text, images and more."],
      ["AI Prompting", "Learn to communicate effectively with AI."],
      ["AI Tools", "Use practical AI tools."],
      ["AI Safety", "Understand responsible AI use."],
      ["AI at Work", "Apply AI to everyday work."],
      ["AI for Learning", "Use AI as a learning assistant."],
      ["AI Projects", "Build a simple AI-assisted project."],
      ["AI Starter Project", "Complete a practical AI project."]
    ]
  },

  Coding: {
    Beginner: [
      ["Programming Basics", "Understand programming fundamentals."],
      ["Variables & Data", "Learn variables and basic data types."],
      ["Conditions", "Make programs make decisions."],
      ["Loops", "Automate repeated tasks."],
      ["Functions", "Create reusable blocks of code."],
      ["Arrays & Objects", "Work with structured data."],
      ["Web Basics", "Understand HTML, CSS and JavaScript."],
      ["APIs", "Understand how applications communicate."],
      ["Debugging", "Find and fix programming problems."],
      ["Coding Project", "Build your first practical coding project."]
    ]
  },

  "Business & Careers": {
    Beginner: [
      ["Business Fundamentals", "Understand how businesses create value."],
      ["Customers", "Learn how to understand customer needs."],
      ["Business Models", "Understand common business models."],
      ["Communication", "Improve professional communication."],
      ["Resume Basics", "Create a strong professional resume."],
      ["Interview Skills", "Practice common interview situations."],
      ["Workplace Skills", "Build practical workplace skills."],
      ["Networking", "Learn how professional networking works."],
      ["Career Planning", "Create a practical career plan."],
      ["Career Project", "Create your first career action plan."]
    ]
  },

  Finance: {
    Beginner: [
      ["Money Basics", "Understand personal finance fundamentals."],
      ["Budgeting", "Learn how to manage income and expenses."],
      ["Saving", "Build effective saving habits."],
      ["Banking Basics", "Understand everyday banking."],
      ["Debt Basics", "Understand borrowing and debt."],
      ["Investing Basics", "Learn the fundamentals of investing."],
      ["Risk", "Understand financial risk."],
      ["Financial Goals", "Set practical financial goals."],
      ["Financial Planning", "Build a basic financial plan."],
      ["Finance Project", "Create your personal finance roadmap."]
    ]
  }
};

const GENERIC_PATHS = [
  "Creative Skills",
  "Education",
  "Local Language",
  "Freelancing",
  "Entrepreneurship",
  "Digital Productivity",
  "Real-Life Roleplay",
  "Projects & Portfolio",
  "Personal Growth"
];

const LANGUAGE_PATHS = [
  "Spoken English",
  "Learn Spanish",
  "Learn French",
  "Learn German",
  "Learn Hindi",
  "Learn Telugu",
  "Learn Tamil",
  "Learn Kannada",
  "Learn Malayalam",
  "Learn Marathi",
  "Learn Bengali",
  "Learn Gujarati",
  "Learn Punjabi",
  "Learn Urdu",
  "Learn Arabic",
  "Learn Japanese",
  "Learn Korean",
  "Learn Chinese",
  "Learn Thai",
  "Learn Portuguese",
  "Learn Italian",
  "Learn Turkish",
  "Learn Russian",
  "Learn Indonesian",
  "Learn Vietnamese"
];

function createGenericLessons(path) {
  return [
    [`${path} Foundations`, `Understand the fundamentals of ${path}.`],
    [`${path} Basics`, `Learn the most useful concepts step by step.`],
    [`Practical Skills`, `Practice important real-world skills.`],
    [`Examples & Practice`, `Learn through practical examples.`],
    [`Real-Life Application`, `Apply what you learned to real situations.`],
    [`AI Tutor Practice`, `Ask GBK AI questions and practice interactively.`],
    [`Guided Project`, `Build a practical project.`],
    [`Final Practice`, `Review, practice and improve your skills.`]
  ];
}

function getCurriculum(path, level) {
  if (CURRICULUMS[path]?.[level]) {
    return CURRICULUMS[path][level];
  }

  if (LANGUAGE_PATHS.includes(path)) {
    const language = path.replace(/^Learn /, "");
    return [
      [`${language} Foundations`, `Learn the fundamentals of ${language}.`],
      [`Useful Words`, `Learn useful ${language} vocabulary.`],
      [`Basic Sentences`, `Build practical ${language} sentences.`],
      [`Listen & Understand`, `Practice listening and understanding ${language}.`],
      [`Speak`, `Practice speaking ${language} with GBK AI.`],
      [`Grammar & Correction`, `Learn grammar and receive AI corrections.`],
      [`Real-Life Conversations`, `Practice realistic conversations.`],
      [`Language Project`, `Complete a practical ${language} speaking project.`]
    ];
  }

  return createGenericLessons(path);
}

export default function LessonPage() {
  const [path, setPath] = useState("Digital Marketing");
  const [level, setLevel] = useState("Beginner");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [learningLanguage, setLearningLanguage] = useState("English");
  const [myLanguage, setMyLanguage] = useState("English");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlPath = params.get("path");
    const urlLesson = params.get("lesson");
    const urlLevel = params.get("level");

    if (urlPath) setPath(urlPath);
    if (urlLevel) setLevel(urlLevel);

    const savedMyLanguage =
      localStorage.getItem("gbk_language") ||
      localStorage.getItem("gbk_my_language");

    const savedTarget =
      localStorage.getItem("gbk_target_language");

    if (savedMyLanguage) setMyLanguage(savedMyLanguage);
    if (savedTarget) setLearningLanguage(savedTarget);

    if (urlLesson) {
      const numericLesson = Number(urlLesson);
      if (!Number.isNaN(numericLesson) && numericLesson >= 0) {
        setLessonIndex(numericLesson);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gbk_target_language", learningLanguage);
  }, [learningLanguage]);

  const lessons = useMemo(
    () => getCurriculum(path, level),
    [path, level]
  );

  const safeIndex = Math.min(
    lessonIndex,
    Math.max(lessons.length - 1, 0)
  );

  const currentLesson = lessons[safeIndex] || lessons[0];

  function changeLevel(nextLevel) {
    setLevel(nextLevel);
    setLessonIndex(0);

    const url = new URL(window.location.href);
    url.searchParams.set("path", path);
    url.searchParams.set("level", nextLevel);
    url.searchParams.set("lesson", "0");
    window.history.replaceState({}, "", url);
  }

  function changeLesson(index) {
    setLessonIndex(index);

    const url = new URL(window.location.href);
    url.searchParams.set("path", path);
    url.searchParams.set("level", level);
    url.searchParams.set("lesson", String(index));
    window.history.replaceState({}, "", url);
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow">📚 TUTOR LESSONS</div>

        <h1>{path}</h1>

        <p className="lead">
          Learn step by step, practice with GBK AI,
          speak, get corrected and improve.
        </p>

        <div className="lesson-controls">
          <label>
            <strong>🌐 My language</strong>
            <select
              className="btn"
              value={myLanguage}
              onChange={(e) => {
                setMyLanguage(e.target.value);
                localStorage.setItem(
                  "gbk_language",
                  e.target.value
                );
              }}
            >
              <option>English</option>
              <option>తెలుగు</option>
              <option>हिन्दी</option>
              <option>मराठी</option>
              <option>বাংলা</option>
              <option>தமிழ்</option>
              <option>ಕನ್ನಡ</option>
              <option>മലയാളം</option>
              <option>ગુજરાતી</option>
              <option>ਪੰਜਾਬੀ</option>
              <option>اردو</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>العربية</option>
              <option>日本語</option>
              <option>한국어</option>
              <option>中文</option>
              <option>ไทย</option>
            </select>
          </label>

          <label>
            <strong>🎯 I want to learn</strong>
            <select
              className="btn"
              value={learningLanguage}
              onChange={(e) =>
                setLearningLanguage(e.target.value)
              }
            >
              <option>English</option>
              <option>తెలుగు</option>
              <option>हिन्दी</option>
              <option>मराठी</option>
              <option>বাংলা</option>
              <option>தமிழ்</option>
              <option>ಕನ್ನಡ</option>
              <option>മലയാളം</option>
              <option>ગુજરાતી</option>
              <option>ਪੰਜਾਬੀ</option>
              <option>اردو</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>Português</option>
              <option>Italiano</option>
              <option>العربية</option>
              <option>Türkçe</option>
              <option>Русский</option>
              <option>Bahasa Indonesia</option>
              <option>Tiếng Việt</option>
              <option>ไทย</option>
              <option>日本語</option>
              <option>한국어</option>
              <option>中文</option>
            </select>
          </label>
        </div>

        <div className="level-row">
          {["Beginner", "Intermediate", "Advanced"].map(
            (item) => (
              <button
                key={item}
                className={
                  level === item
                    ? "level active"
                    : "level"
                }
                onClick={() => changeLevel(item)}
              >
                {item}
              </button>
            )
          )}
        </div>

        <div className="learning-flow">
          <span className="active">1 Learn</span>
          <span>2 Listen</span>
          <span>3 Speak</span>
          <span>4 Correct</span>
          <span>5 Repeat</span>
        </div>

        <div className="lesson-card">
          <div className="lesson-number">
            Lesson {safeIndex + 1} of {lessons.length}
          </div>

          <h2>{currentLesson?.[0]}</h2>

          <p>{currentLesson?.[1]}</p>

          <div className="lesson-info">
            <strong>Learning language</strong>
            <span>{learningLanguage}</span>
          </div>

          <div className="lesson-info">
            <strong>My language</strong>
            <span>{myLanguage}</span>
          </div>

          <div className="lesson-info">
            <strong>Level</strong>
            <span>{level}</span>
          </div>
        </div>

        <div className="lesson-list">
          <h3>📖 Curriculum</h3>

          {lessons.map((item, index) => (
            <button
              key={`${item[0]}-${index}`}
              className={
                index === safeIndex
                  ? "lesson-item selected"
                  : "lesson-item"
              }
              onClick={() => changeLesson(index)}
            >
              <span>
                {index + 1}. {item[0]}
              </span>

              <small>{item[1]}</small>
            </button>
          ))}
        </div>

        <section className="path-tutor">
          <div className="eyebrow">🤖 PATH AI TUTOR</div>

          <h2>Ask GBK AI about this lesson</h2>

          <p>
            GBK AI knows your current path, level, lesson,
            my language and learning language.
          </p>

          <VoiceCoach
            path={path}
            level={level}
            lesson={currentLesson?.[0] || ""}
            targetLanguage={learningLanguage}
          />
        </section>
      </section>
    </main>
  );
}
