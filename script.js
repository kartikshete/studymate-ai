// ===== PART 13: API KEY SAVE FUNCTIONALITY =====

const apiKeyInput = document.getElementById("apiKey");
const saveApiKeyBtn = document.getElementById("saveApiKey");
const apiStatus = document.getElementById("apiStatus");

saveApiKeyBtn.addEventListener("click", function () {
    const apiKey = apiKeyInput.value.trim();

    if (apiKey === "") {
        apiStatus.textContent = "Please enter your API key!";
        apiStatus.className = "api-status error";
        return;
    }

    // Save key for the current browser session
    sessionStorage.setItem("geminiApiKey", apiKey);

    apiStatus.textContent = "API key saved successfully!";
    apiStatus.className = "api-status success";

    apiKeyInput.value = "";
});

// Check whether an API key exists
if (sessionStorage.getItem("geminiApiKey")) {
    apiStatus.textContent = "API key is configured.";
    apiStatus.className = "api-status success";
}
// ===== PART 14: GEMINI API CONNECTION =====

async function generateAIResponse(prompt) {
    const apiKey = sessionStorage.getItem("geminiApiKey");

    if (!apiKey) {
        throw new Error("Please save your Gemini API key first!");
    }

    if (!prompt.trim()) {
        throw new Error("Please enter your notes or topic!");
    }

    const API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },

            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Gemini API request failed!"
            );
        }

        return data.candidates[0].content.parts
            .map(part => part.text || "")
            .join("");

    } catch (error) {
        console.error("AI Error:", error);
        throw error;
    }
}
// ===== PART 15: AI SUMMARY GENERATOR =====

const notesInput = document.getElementById("notesInput");
const generateSummaryBtn = document.getElementById("generateSummaryBtn");
const summaryOutput = document.getElementById("summaryOutput");
const loading = document.getElementById("loading");

generateSummaryBtn.addEventListener("click", async function () {

    const notes = notesInput.value.trim();

    if (notes === "") {
        alert("Please enter your notes first!");
        return;
    }

    try {
        loading.classList.remove("hidden");
        summaryOutput.innerHTML = "";
        generateSummaryBtn.disabled = true;

        const prompt = `
        Create a simple and easy-to-understand summary
        of the following study notes.

        Use clear headings and bullet points.

        Notes:
        ${notes}
        `;

        const result = await generateAIResponse(prompt);
// Generate AI Quiz
await generateQuiz(notes);

    } catch (error) {
        summaryOutput.textContent = error.message;
    }

    finally {
        loading.classList.add("hidden");
        generateSummaryBtn.disabled = false;
    }
});
// ===== PART 16: AI QUIZ GENERATOR =====

let quizData = [];

async function generateQuiz(notes) {

    const difficulty = document.getElementById("difficulty").value;

    const prompt = `
    Create exactly 5 multiple-choice questions based on these notes.

    Difficulty: ${difficulty}

    Return ONLY valid JSON in this format:

    {
        "questions": [
            {
                "question": "Question here?",
                "options": [
                    "Option A",
                    "Option B",
                    "Option C",
                    "Option D"
                ],
                "answer": 0,
                "explanation": "Explain the correct answer."
            }
        ]
    }

    The answer must be the correct option index (0 to 3).

    Notes:
    ${notes}
    `;

    const response = await generateAIResponse(prompt);

    const cleanResponse = response
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const data = JSON.parse(cleanResponse);

    if (!data.questions || data.questions.length !== 5) {
        throw new Error("AI did not generate exactly 5 questions.");
    }

    quizData = data.questions;

    displayQuiz(quizData);
}


// Display Quiz Questions
function displayQuiz(questions) {

    const quizContainer = document.getElementById("quizContainer");

    quizContainer.innerHTML = "";

    questions.forEach((item, index) => {

        const questionDiv = document.createElement("div");

        questionDiv.className = "quiz-question";

        const heading = document.createElement("h3");

        heading.textContent =
            `${index + 1}. ${item.question}`;

        questionDiv.appendChild(heading);

        item.options.forEach((option, optionIndex) => {

            const label = document.createElement("label");

            const radio = document.createElement("input");

            radio.type = "radio";
            radio.name = `question${index}`;
            radio.value = optionIndex;

            label.appendChild(radio);
            label.appendChild(
                document.createTextNode(" " + option)
            );

            questionDiv.appendChild(label);

        });

        quizContainer.appendChild(questionDiv);

    });

    document.getElementById("submitQuizBtn")
        .classList.remove("hidden");
}
async function generateQuiz(notes) {
    const prompt = `
    Create exactly 5 multiple choice questions
    based on these notes:

    ${notes}

    Return only valid JSON in this format:
    [
      {
        "question": "Question here",
        "options": ["A", "B", "C", "D"],
        "answer": "Correct option",
        "explanation": "Explanation here"
      }
    ]
    `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        const data = await response.json();

        const result = data.candidates[0].content.parts[0].text;

        const questions = JSON.parse(
            result.replace(/```json|```/g, "").trim()
        );

        quizContainer.innerHTML = "";

        questions.forEach((q, index) => {
            quizContainer.innerHTML += `
                <div class="quiz-question">
                    <h3>${index + 1}. ${q.question}</h3>

                    ${q.options.map(option => `
                        <label>
                            <input type="radio"
                                name="question${index}"
                                value="${option}">
                            ${option}
                        </label><br>
                    `).join("")}
                </div>
            `;
        });

    } catch (error) {
        console.error("Quiz Error:", error);
        alert("Unable to generate quiz!");
    }
}
async function generateFlashcards(notes) {

    const prompt = `
    Create 5 flashcards from these notes.

    Return only JSON:
    [
        {
            "question": "What is JavaScript?",
            "answer": "JavaScript is a programming language."
        }
    ]

    Notes: ${notes}
    `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        const data = await response.json();

        const result = data.candidates[0].content.parts[0].text;

        const cards = JSON.parse(
            result.replace(/```json|```/g, "").trim()
        );

        flashcardContainer.innerHTML = "";

        cards.forEach((card) => {

            const div = document.createElement("div");

            div.className = "flashcard";

            div.innerHTML = `
                <h3>${card.question}</h3>
                <p class="answer" style="display:none">
                    ${card.answer}
                </p>
                <button type="button">Show Answer</button>
            `;

            const button = div.querySelector("button");
            const answer = div.querySelector(".answer");

            button.addEventListener("click", () => {

                if (answer.style.display === "none") {
                    answer.style.display = "block";
                    button.textContent = "Hide Answer";
                } else {
                    answer.style.display = "none";
                    button.textContent = "Show Answer";
                }

            });

            flashcardContainer.appendChild(div);

        });

    } catch (error) {
        console.error("Flashcard Error:", error);
        alert("Unable to generate flashcards!");
    }
}
// ===== PART 18: QUIZ SCORING SYSTEM =====

const quizResult = document.getElementById("quizResult");

submitQuizBtn.addEventListener("click", function () {

    let correctAnswers = 0;
    let wrongAnswers = 0;

    if (!quizData || quizData.length === 0) {
        alert("Please generate a quiz first!");
        return;
    }

    quizData.forEach((question, index) => {

        const selectedOption = document.querySelector(
            `input[name="question${index}"]:checked`
        );

        if (selectedOption) {

            if (Number(selectedOption.value) === Number(question.answer)) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }

        } else {
            wrongAnswers++;
        }

    });

    // Calculate score

    const totalQuestions = quizData.length;

    const percentage = Math.round(
        (correctAnswers / totalQuestions) * 100
    );

    // Display result

    quizResult.innerHTML = `
        <div class="quiz-result-card">

            <h2>🎉 Quiz Completed!</h2>

            <h1>${percentage}%</h1>

            <p>Correct Answers: ${correctAnswers}</p>

            <p>Wrong Answers: ${wrongAnswers}</p>

            <p>Total Questions: ${totalQuestions}</p>

            <h3>
                ${
                    percentage >= 80
                    ? "Excellent Performance! 🌟"
                    : percentage >= 50
                    ? "Good Job! 👍"
                    : "Keep Practicing! 💪"
                }
            </h3>

        </div>
    `;

    quizResult.style.display = "block";

    submitQuizBtn.disabled = true;

    quizResult.scrollIntoView({
        behavior: "smooth"
    });

});
