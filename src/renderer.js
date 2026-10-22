
const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");

let selectedImage = "";
let conversationHistory = [];

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];

    if (!file) {
        selectedImage = "";
        imagePreview.innerHTML = "";
        return;
    }

    selectedImage = "";
    conversationHistory = [];
    chatBox.innerHTML = "";

    const imageUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    imagePreview.innerHTML = "";

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "Selected image";

    imagePreview.appendChild(image);

    reader.onload = function () {
        selectedImage = reader.result;
    };

    reader.readAsDataURL(file);
});

async function sendMessage() {
    const question = messageInput.value.trim();

    if (!selectedImage) {
        alert("Please select an image first.");
        return;
    }

    if (question === "") {
        alert("Please enter a question.");
        return;
    }

    if (sendButton.disabled) {
        return;
    }

    const userMessage = document.createElement("p");
    userMessage.textContent = "You: " + question;
    chatBox.appendChild(userMessage);

    messageInput.value = "";
    sendButton.disabled = true;

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "AI is thinking...";
    chatBox.appendChild(loadingMessage);

    try {
        const answer = await window.imageAI.ask({
            image: selectedImage,
            question: question,
            history: conversationHistory
        });

        conversationHistory.push({
            role: "user",
            content: question
        });

        conversationHistory.push({
            role: "assistant",
            content: answer
        });

        loadingMessage.textContent = "AI: " + answer;
    } catch (error) {
        console.error("Image analysis failed:", error);

        loadingMessage.textContent =
            "AI: Sorry, something went wrong. Please check your internet connection or API setup and try again.";
    } finally {
        sendButton.disabled = false;
        messageInput.focus();
    }
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
