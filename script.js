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
