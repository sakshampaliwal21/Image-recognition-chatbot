const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    const imageUrl = URL.createObjectURL(file);

    imagePreview.innerHTML = "";

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "Selected image";

    imagePreview.appendChild(image);
});

const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");

let selectedImage = "";
let conversationHistory = [];


imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        selectedImage = reader.result;
    };

    reader.readAsDataURL(file);
});

sendButton.addEventListener("click", async function () {
    const question = messageInput.value.trim();

    if (!selectedImage) {
        alert("Please select an image first.");
        return;
    }

    if (question === "") {
        alert("Please enter a question.");
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
    loadingMessage.textContent =
        "Sorry, I couldn't analyze the image. Please try again.";
}


    sendButton.disabled = false;
});
