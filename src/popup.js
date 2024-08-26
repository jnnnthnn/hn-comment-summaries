const chromeStorageKey = "openAiSecret";

document.addEventListener("DOMContentLoaded", function () {
  checkExistingKey();

  document
    .getElementById("configForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const apiKey = document.getElementById("apiKey").value;

      // test key
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Say hello to the user.",
            },
            {
              role: "user",
              content: `hello`,
            },
          ],
        }),
      });

      if (!res.ok) {
        showConfirmation("API key is invalid.", true);
        return;
      }

      chrome.storage.local.set({ [chromeStorageKey]: apiKey }, function () {
        showConfirmation("API key saved successfully!");
      });
    });
});

function checkExistingKey() {
  chrome.storage.local.get(chromeStorageKey, function (result) {
    const statusElement = document.createElement("p");
    statusElement.id = "keyStatus";
    if (!result[chromeStorageKey]) {
      return;
    }
    statusElement.textContent = "An API key is configured.";
    statusElement.style.color = "#4CAF50";
    document
      .getElementById("configForm")
      .insertAdjacentElement("beforebegin", statusElement);
  });
}

function showConfirmation(message, isError = false) {
  const confirmationElement = document.createElement("div");
  confirmationElement.textContent = message;
  confirmationElement.style.cssText = `
    background-color: ${isError ? "#FF0000" : "#4CAF50"};
    color: white;
    padding: 10px;
    margin-top: 10px;
    border-radius: 4px;
  `;
  document.body.appendChild(confirmationElement);

  setTimeout(() => {
    confirmationElement.remove();
  }, 5000);

  // Update the key status message
  const statusElement = document.getElementById("keyStatus");
  if (statusElement) {
    statusElement.textContent = "An API key is configured.";
    statusElement.style.color = "#4CAF50";
  }
}
