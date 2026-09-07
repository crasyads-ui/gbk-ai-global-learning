"use client";

import { useEffect, useState } from "react";
import VoiceCoach from "../components/VoiceCoach";

const LESSONS = {
  "Spoken English": [
    ["Introduce Yourself", "Learn a simple professional self-introduction.", "My name is Alex. I am learning English."],
    ["Everyday Conversation", "Practice useful daily conversation.", "How are you today?"],
    ["Asking Questions", "Learn how to ask clear questions.", "Could you explain this to me?"],
    ["Workplace English", "Practice useful workplace communication.", "Could you please send me the details?"],
    ["Pronunciation Practice", "Speak short sentences clearly and naturally.", "I want to improve my English."],
  ],

  "AI & Technology": [
    ["AI Basics", "Understand what artificial intelligence means.", "Artificial intelligence helps computers perform useful tasks."],
    ["Using AI Tools", "Learn how to give AI clear instructions.", "Explain this topic in simple language."],
    ["AI Safety", "Learn responsible and safe AI use.", "I should verify important information before using it."],
  ],

  Coding: [
    ["Programming Basics", "Understand variables, conditions and functions.", "A variable stores information that a program can use."],
    ["Build a Small Project", "Turn an idea into a simple working project.", "I can build this feature step by step."],
    ["Debugging", "Learn how to find and fix coding problems.", "I will check the error and test the solution."],
  ],

  "Digital Marketing": [
    ["Marketing Basics", "Understand customers, content and channels.", "Good marketing starts by understanding the customer."],
    ["Content Strategy", "Learn how to plan useful content.", "This content helps solve a real customer problem."],
    ["SEO Basics", "Understand how search visibility works.", "Useful content can help people find my website."],
  ],

  "Business & Careers": [
    ["Professional Introduction", "Present yourself confidently.", "I have experience in this area and I am ready to learn more."],
    ["Interview Practice", "Practice answering common interview questions.", "I am a quick learner and enjoy solving problems."],
    ["Workplace Communication", "Communicate clearly and professionally.", "I will complete this task and update you shortly."],
  ],

  Finance: [
    ["Money Basics", "Understand income, spending and saving.", "I will track my income and expenses."],
    ["Budgeting", "Learn how to create a practical budget.", "I want to save money for my future goals."],
    ["Investing Basics", "Understand basic investing concepts.", "I should understand the risks before investing."],
  ],

  "Creative Skills": [
    ["Creative Thinking", "Generate and improve useful ideas.", "Let me explore a few different ideas."],
    ["Writing Basics", "Write clearly for your audience.", "The main idea should be clear and easy to understand."],
    ["Presentation Skills", "Present ideas with confidence.", "Today I will explain my idea in three simple steps."],
  ],

  Education: [
    ["Study Skills", "Learn practical ways to study effectively.", "I will break this topic into smaller parts."],
    ["Revision Practice", "Review important information efficiently.", "I can explain this concept in my own words."],
    ["Exam Preparation", "Practice answering questions clearly.", "I will read the question carefully before answering."],
  ],

  "Local Language": [
    ["Useful Words", "Learn practical vocabulary for everyday life.", "I want to learn useful words for daily conversation."],
    ["Conversation Practice", "Build confidence through simple conversations.", "Can you help me practice this conversation?"],
    ["Translation Practice", "Learn how to understand and express ideas.", "Please explain this sentence in my language."],
  ],

  Freelancing: [
    ["Freelancing Basics", "Understand clients, projects and skills.", "I can help you with this project."],
    ["Client Communication", "Learn professional client communication.", "Could you please share the project requirements?"],
    ["Portfolio Building", "Turn your work into proof of your skills.", "Here are some examples of my previous work."],
  ],

  Entrepreneurship: [
    ["Business Ideas", "Learn how to identify useful problems.", "What problem can my product solve?"],
    ["Customer Research", "Understand what customers actually need.", "I want to understand my customer's biggest problem."],
    ["Business Planning", "Turn an idea into a practical plan.", "I will test the idea before investing heavily."],
  ],

  "Digital Productivity": [
    ["Email Skills", "Write clear and professional emails.", "Could you please confirm the next steps?"],
    ["Research Skills", "Find and organize useful information.", "I will compare reliable sources before deciding."],
    ["AI Workflows", "Use AI to improve everyday tasks.", "Help me turn this task into a simple workflow."],
  ],

  "Real-Life Roleplay": [
    ["At a Shop", "Practice buying something confidently.", "How much does this cost?"],
    ["At Work", "Practice a realistic workplace conversation.", "Could we discuss this task for a few minutes?"],
    ["Travel", "Practice useful travel communication.", "Could you please tell me how to get there?"],
  ],

  "Projects & Portfolio": [
    ["Choose a Project", "Turn a skill into a practical project.", "I want to build a project that demonstrates my skills."],
    ["Build and Test", "Practice turning an idea into working output.", "I will build the first version and test it."],
    ["Show Your Work", "Learn how to explain your project.", "This project demonstrates what I can do."],
  ],

  "Personal Growth": [
    ["Confidence", "Practice clear and confident communication.", "I can improve by practicing every day."],
    ["Goal Planning", "Turn goals into practical actions.", "My next step is clear and achievable."],
    ["Communication", "Improve everyday communication skills.", "I will listen carefully before responding."],
  ],
};

export default function Lesson() {
  const [path, setPath] = useState("Spoken English");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("path") || "Spoken English";

    setPath(
      LESSONS[requested]
        ? requested
        : "Spoken English"
    );
  }, []);

  const lessons = LESSONS[path] || LESSONS["Spoken English"];
  const lesson = lessons[selected] || lessons[0];

  return (
    <main className="page">

      <section className="top">
        <span className="badge">📚 TUTOR LESSONS</span>

        <h1>{path}</h1>

        <p>
          Learn step by step, practice with GBK AI,
          speak, get corrected and improve.
        </p>
      </section>

      <section className="card">

        <div className="steps">
          <span className="active">1 Learn</span>
          <span>2 Listen</span>
          <span>3 Speak</span>
          <span>4 Correct</span>
          <span>5 Repeat</span>
        </div>

        <div className="lessonbox">

          <span className="badge small">
            Lesson {selected + 1} of {lessons.length}
          </span>

          <h2>{lesson[0]}</h2>

          <p>{lesson[1]}</p>

          <div className="coachResult">
            <strong>Today's practice sentence</strong>

            <p>{lesson[2]}</p>
          </div>

        </div>

      </section>

      <section className="card">

        <h2>📚 Available Lessons</h2>

        <div className="grid">

          {lessons.map((item, index) => (
            <button
              key={item[0]}
              className={`card mini ${
                selected === index ? "active" : ""
              }`}
              onClick={() => setSelected(index)}
            >
              <span className="badge small">
                Lesson {index + 1}
              </span>

              <h3>{item[0]}</h3>

              <p>{item[1]}</p>
            </button>
          ))}

        </div>

      </section>

      <VoiceCoach />

    </main>
  );
}
