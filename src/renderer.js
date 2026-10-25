const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");
const newChatButton = document.getElementById("new-chat");

let selectedImage = "";
let conversationHistory = [];

newChatButton.addEventListener("click", function () {
    conversationHistory = [];
    selectedImage = "";
    chatBox.innerHTML = "";
    imagePreview.innerHTML = "";
    imageInput.value = "";
    messageInput.value = "";
    sendButton.disabled = false;
    messageInput.focus();
});

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) {
        selectedImage = "";
        imagePreview.innerHTML = "";
        return; }

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
    const img = new Image();

    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        selectedImage = canvas.toDataURL("image/jpeg", 0.85);
    };

    img.src = reader.result;
};

reader.readAsDataURL(file);});

async function sendMessage() {
    const question = messageInput.value.trim();

    if (!selectedImage) {
        alert("Please select an image first.");
        return;}

    if (question === "") {
        alert("Please enter a question.");
        return; }

    if (sendButton.disabled) {
        return;}

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
            image: selectedImage, question: question,history: conversationHistory
        });

        conversationHistory.push({role: "user",
            content: question});
        conversationHistory.push({role: "assistant",content: answer});

        loadingMessage.innerHTML = "AI: " + DOMPurify.sanitize(marked.parse(answer));
        const copyButton = document.createElement("button");
        copyButton.textContent = "Copy";
        copyButton.style.marginLeft = "10px";

        copyButton.addEventListener("click", async function () {
            try {await navigator.clipboard.writeText(answer);
                copyButton.textContent = "Copied!";
            } catch (error) {
                alert("Unable to copy response."); }
        });

loadingMessage.appendChild(copyButton);
    } catch (error) {
    console.error("Image analysis failed:", error);
    loadingMessage.textContent = "AI Error: " + error.message;
    }finally {
        sendButton.disabled = false; messageInput.focus();}}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
