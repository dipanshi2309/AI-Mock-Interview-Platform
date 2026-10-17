const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI Service initialized with provided API key.');
  } catch (error) {
    console.error('Error initializing Gemini AI Service:', error.message);
  }
} else {
  console.log('No GEMINI_API_KEY found in environment. Using Mock AI Service fallback.');
}

// Built-in Mock Database of Questions for Fallback / Offline mode
const mockQuestionsStore = {
  javascript: {
    junior: [
      { id: 1, questionText: "What is the difference between 'let', 'const', and 'var'?", sampleAnswer: "var is function-scoped and hoisted. let and const are block-scoped. const variables cannot be reassigned after definition." },
      { id: 2, questionText: "What are the primitive data types in JavaScript?", sampleAnswer: "string, number, boolean, null, undefined, symbol, and bigint." },
      { id: 3, questionText: "Explain the concept of closures in JavaScript.", sampleAnswer: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment)." },
      { id: 4, questionText: "What is the difference between '==' and '==='?", sampleAnswer: "== checks for value equality with type coercion. === checks for strict equality without type coercion (both value and type must match)." },
      { id: 5, questionText: "What is an event loop and how does it handle asynchronous code?", sampleAnswer: "The event loop is a mechanism that allows JS to perform non-blocking I/O operations by offloading tasks to the system kernel and executing callbacks from the task queue when the call stack is empty." }
    ],
    intermediate: [
      { id: 1, questionText: "Explain how 'this' keyword works in JavaScript.", sampleAnswer: "The value of 'this' is determined by how a function is called. In global execution context, it refers to the global object. In a method, it refers to the owner object. Arrow functions don't have their own 'this'; they inherit it lexically." },
      { id: 2, questionText: "What is a Promise and what are its different states?", sampleAnswer: "A Promise is an object representing the eventual completion or failure of an asynchronous operation. States are: pending, fulfilled, or rejected." },
      { id: 3, questionText: "What is the difference between synchronous and asynchronous operations?", sampleAnswer: "Synchronous execution is sequential (each task waits for the previous to finish). Asynchronous execution allows tasks to execute in the background, permitting other code to run concurrently." },
      { id: 4, questionText: "Explain prototype inheritance in JavaScript.", sampleAnswer: "Objects in JS have a link to a prototype object. When trying to access a property, JS searches the object first, then its prototype, up the chain until it finds it or reaches null." },
      { id: 5, questionText: "What is the difference between call, apply, and bind?", sampleAnswer: "call invokes a function with a specified 'this' and comma-separated arguments. apply does the same but accepts arguments as an array. bind returns a new function with 'this' bound, to be executed later." }
    ],
    senior: [
      { id: 1, questionText: "Explain memory leaks in JavaScript and how to prevent them.", sampleAnswer: "Memory leaks occur when allocated memory is no longer needed but not released. Common causes: global variables, forgotten timers/callbacks, out-of-DOM references. Prevent by scoping variables, clearing intervals, and removing listeners." },
      { id: 2, questionText: "Describe the differences between microtasks and macrotasks in the event loop.", sampleAnswer: "Microtasks (Promises, process.nextTick) have higher priority and run immediately after the current script and before the next rendering or macrotask (setTimeout, setInterval, I/O). The microtask queue is fully cleared before the next macrotask is processed." },
      { id: 3, questionText: "How would you optimize performance in a high-throughput Node.js/JS application?", sampleAnswer: "Optimize using stream piping for files, caching databases, avoid blocking code on the main thread, use worker threads for CPU-intensive tasks, cluster instances, and optimize database queries." }
    ]
  },
  react: {
    junior: [
      { id: 1, questionText: "What is the Virtual DOM and how does React use it?", sampleAnswer: "The Virtual DOM is a lightweight representation of the real DOM. React updates the virtual DOM, compares it with a snapshot using a diffing algorithm, and updates only the changed parts of the real DOM (reconciliation)." },
      { id: 2, questionText: "What is the difference between props and state?", sampleAnswer: "Props are external parameters passed into a component (immutable by the component). State is internal data managed within the component (mutable via state updater functions)." },
      { id: 3, questionText: "What are React Hooks? Name some common hooks.", sampleAnswer: "Hooks let you use state and other React features without writing a class. Examples: useState, useEffect, useContext, useRef." }
    ],
    intermediate: [
      { id: 1, questionText: "Explain the lifecycle of a React component in terms of Hooks.", sampleAnswer: "Mounting is handled by useEffect with an empty dependency array. Updating is handled by useEffect with specific dependencies. Unmounting (cleanup) is handled by the return function inside useEffect." },
      { id: 2, questionText: "What is React Context and when should you use it?", sampleAnswer: "React Context provides a way to pass data through the component tree without having to pass props down manually at every level. Useful for global data like themes, user authentication, or languages." },
      { id: 3, questionText: "How do you optimize React component rendering performance?", sampleAnswer: "Use React.memo for component caching, useMemo for expensive calculations, useCallback to cache function references, and split bundles using lazy loading." }
    ],
    senior: [
      { id: 1, questionText: "Explain the concept of Concurrent Mode and Server Components in React.", sampleAnswer: "Concurrent rendering allows React to interrupt, pause, or resume rendering, keeping the main thread responsive. React Server Components render on the server, sending pre-compiled html/json, reducing client-side bundle size and data-fetching latency." }
    ]
  },
  hr: {
    junior: [
      { id: 1, questionText: "Tell me about yourself.", sampleAnswer: "Provide a structured pitch focusing on educational background, interest in technology, key projects built, and enthusiasm for starting a career in the field." },
      { id: 2, questionText: "Why do you want to work for our company?", sampleAnswer: "Align personal values and career growth with the company's mission, recent achievements, workspace culture, or technology stack." },
      { id: 3, questionText: "Where do you see yourself in 5 years?", sampleAnswer: "Show a commitment to learning, developing expertise in software development, progressing to leadership or senior architectural roles, and contributing value to the team." }
    ],
    intermediate: [
      { id: 1, questionText: "Describe a situation where you had a conflict with a teammate and how you resolved it.", sampleAnswer: "Use the STAR method (Situation, Task, Action, Result). Focus on communication, empathy, objective analysis of the issue, finding a compromised win-win solution, and maintaining a positive workspace relation." },
      { id: 2, questionText: "How do you handle tight deadlines or high-pressure situations?", sampleAnswer: "Describe prioritization techniques (e.g. Eisenhower Matrix), breaking down complex problems, communicating status updates early to stakeholders, and maintaining work-life boundary strategies." }
    ],
    senior: [
      { id: 1, questionText: "How do you mentor junior developers or build team culture?", sampleAnswer: "Foster psychologically safe environments, set clear standards, conduct constructive code reviews, hold pairing sessions, share knowledge through documentations, and champion collaborative decision-making." }
    ]
  }
};

// A pool of generic question templates to select from randomly for custom subjects
const genericQuestionTemplates = [
  "Describe your experience working with {topic} in your previous projects or academic work.",
  "What are the core advantages and design benefits of using {topic} compared to alternative technologies?",
  "Explain how error handling and debugging are typically managed in a project built with {topic}.",
  "How do you ensure security and follow industry best practices when programming with {topic}?",
  "Describe a scenario where you optimized performance or resolved a complex issue in a {topic} codebase.",
  "How does {topic} handle data flows, state updates, or integration with external database systems?",
  "What are some common pitfalls or mistakes developers make when using {topic}, and how do you avoid them?",
  "Explain how you would write unit tests or perform manual validations for features built with {topic}.",
  "What is your approach to structuring folders, modules, and components in a large-scale project using {topic}?",
  "If you had to teach a junior developer the most critical aspect of {topic}, what concept would you focus on first?"
];

// Shuffler helper
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Generates generic questions for unsupported fields in mock mode
const generateGenericQuestions = (topic, level, count) => {
  const shuffledTemplates = shuffle(genericQuestionTemplates);
  const questions = [];
  
  for (let i = 0; i < Math.min(count, shuffledTemplates.length); i++) {
    const questionText = shuffledTemplates[i].replace(/{topic}/g, topic);
    questions.push({
      id: i + 1,
      questionText,
      sampleAnswer: `The ideal answer should address problem solving, familiarity with standard ${topic} concepts, troubleshooting steps, and final achievements.`
    });
  }
  return questions;
};

// Service object containing standard AI API triggers
const aiService = {
  generateQuestions: async (topic, level, count = 4) => {
    const formattedTopic = topic.toLowerCase().trim();
    const formattedLevel = level.toLowerCase().trim();

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an expert technical and HR interviewer. Generate exactly ${count} interview questions for the topic "${topic}" and candidate experience level "${level}".
        Respond with a valid JSON array only, containing objects with keys:
        - id (1-indexed integer)
        - questionText (the interview question)
        - sampleAnswer (a brief overview of what the ideal answer should cover)

        Do not wrap the response in markdown blocks or include any extra text. Just output the raw JSON array. Make sure the JSON is perfectly valid.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Clean markdown backticks if returned
        const jsonString = text.replace(/^```json/i, '').replace(/```$/, '').trim();
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('Gemini API generateQuestions failed, falling back to mock questions. Error:', error.message);
      }
    }

    // Fallback Mock Logic
    let questionsList = [];
    if (mockQuestionsStore[formattedTopic] && mockQuestionsStore[formattedTopic][formattedLevel]) {
      questionsList = shuffle(mockQuestionsStore[formattedTopic][formattedLevel]);
    } else if (mockQuestionsStore[formattedTopic]) {
      const allLevels = Object.values(mockQuestionsStore[formattedTopic]).flat();
      questionsList = shuffle(allLevels);
    } else {
      questionsList = generateGenericQuestions(topic, formattedLevel, count);
    }

    // Limit to requested count or pad if necessary
    if (questionsList.length > count) {
      questionsList = questionsList.slice(0, count);
    } else if (questionsList.length < count) {
      const padding = generateGenericQuestions(topic, formattedLevel, count - questionsList.length);
      questionsList = [...questionsList, ...padding];
    }

    // Re-index output questions chronologically
    return questionsList.map((q, idx) => ({ ...q, id: idx + 1 }));
  },

  evaluateAnswers: async (questions, answers) => {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an expert interviewer evaluating a candidate's responses.
        Here are the questions asked and the candidate's answers:
        ${JSON.stringify(questions.map((q, idx) => ({ question: q.questionText, answer: answers[idx] || "No answer provided" })))}

        Evaluate each answer individually. Also calculate an overall score (0 to 100) and general constructive feedback.
        Respond with a valid JSON object only. The JSON object must have the following keys:
        - overallScore: integer from 0 to 100
        - overallFeedback: string summarizing the performance, strength, and major area to improve
        - feedback: array of objects corresponding to each question:
          - questionId: integer matching the question id
          - score: score for this answer (0 to 10)
          - evaluation: evaluation of the user's answer (pros, cons, and details)
          - tips: helpful advice on how the candidate can improve this answer

        Do not wrap the response in markdown blocks or include any extra text. Just output the raw JSON. Make sure the JSON is perfectly valid.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Clean markdown backticks if returned
        const jsonString = text.replace(/^```json/i, '').replace(/```$/, '').trim();
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('Gemini API evaluateAnswers failed, falling back to mock evaluation. Error:', error.message);
      }
    }

    // Mock Evaluation Fallback Logic
    let totalScore = 0;
    const feedbackList = questions.map((q, idx) => {
      const answer = answers[idx] || '';
      const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
      
      let score = 0;
      let evaluation = '';
      let tips = '';

      if (wordCount === 0) {
        score = 0;
        evaluation = "No answer was provided for this question.";
        tips = "Try to formulate an answer even if you are unsure. Stating what you know and how you would research shows problem-solving initiative.";
      } else if (wordCount < 10) {
        score = Math.floor(Math.random() * 3) + 3; // 3 to 5
        evaluation = "The answer is too brief. While it mentions some correct keywords, it lack explanation, details, or context.";
        tips = "Elaborate more on your answers. Try to explain 'why' and 'how' rather than just stating definitions. Include brief real-world examples if possible.";
      } else if (wordCount < 30) {
        score = Math.floor(Math.random() * 3) + 6; // 6 to 8
        evaluation = "Good response. The answer covers the core concepts correctly and communicates the point clearly.";
        tips = "To elevate this to a top-tier answer, discuss edge cases, performance trade-offs, or structural patterns that apply to the scenario.";
      } else {
        score = Math.floor(Math.random() * 2) + 8; // 8 to 10
        evaluation = "Excellent, comprehensive answer! You explained the concepts clearly, provided deep context, and structures your thoughts well.";
        tips = "Keep up the great communication. You can reinforce your answers by referencing specific project experiences where you encountered these exact challenges.";
      }

      totalScore += score;

      return {
        questionId: q.id,
        score,
        evaluation,
        tips
      };
    });

    const averageTenScore = questions.length > 0 ? (totalScore / questions.length) : 0;
    const overallScore = Math.min(100, Math.round(averageTenScore * 10));

    let overallFeedback = '';
    if (overallScore >= 80) {
      overallFeedback = "Outstanding performance! You demonstrated exceptional domain knowledge and clear, concise communication. To improve, keep practicing advanced edge cases and architecture questions.";
    } else if (overallScore >= 60) {
      overallFeedback = "Solid performance. You have a good handle on foundational concepts, but some answers lacked detail or structural clarity. Work on elaborating your answers with practical examples and structured explanations.";
    } else {
      overallFeedback = "Needs practice. Many responses were either missing or too brief. Focus on building technical confidence, reading core documentations, and structuring answers using the STAR method for behavioral questions.";
    }

    return {
      overallScore,
      overallFeedback,
      feedback: feedbackList
    };
  }
};

module.exports = aiService;
