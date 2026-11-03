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

        summaryOutput.textContent = result;

    } catch (error) {
        summaryOutput.textContent = error.message;
    }

    finally {
        loading.classList.add("hidden");
        generateSummaryBtn.disabled = false;
    }
});