
const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");
const newChatButton = document.getElementById("new-chat");
const suggestedPrompts = document.getElementById("suggested-prompts");
const themeToggle = document.getElementById("theme-toggle");

let selectedImage = "";
let conversationHistory = [];



function openImagePreview(src) {
    const overlay = document.createElement("div");
    overlay.className = "image-modal";

    const preview = document.createElement("img");
    preview.src = src;
    preview.alt = "Full image preview";

    const closeButton = document.createElement("button");
    closeButton.className = "image-modal-close";
    closeButton.textContent = "✕";
    closeButton.setAttribute("aria-label", "Close preview");

    overlay.appendChild(preview);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);

    function closePreview() {
        overlay.remove();
        document.removeEventListener("keydown", escapeHandler);
    }

    function escapeHandler(event) {
        if (event.key === "Escape") {
            closePreview();
        }
    }

    overlay.addEventListener("click", closePreview);

    preview.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    closeButton.addEventListener("click", closePreview);

    document.addEventListener("keydown", escapeHandler);
}




function makeImageClickable(image) {
    image.style.cursor = "zoom-in";

    image.addEventListener("click", function () {
        openImagePreview(image.src);
    });
}



themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }
});




function hideSuggestedPrompts() {
    suggestedPrompts.hidden = true;
}

function showSuggestedPrompts() {
    suggestedPrompts.hidden = false;
}

document.querySelectorAll(".prompt-chip").forEach(function (button) {
    button.addEventListener("click", function () {
        messageInput.value = button.dataset.prompt;
        messageInput.focus();
    });
});



newChatButton.addEventListener("click", function () {
    conversationHistory = [];
    selectedImage = "";

    chatBox.innerHTML = `
        <div class="welcome">
            <h2>What would you like to explore?</h2>
            <p>Upload an image to get started.</p>
        </div>
    `;

    imagePreview.innerHTML = "";
    imageInput.value = "";
    messageInput.value = "";

    hideSuggestedPrompts();

    sendButton.disabled = false;
    messageInput.focus();
});




imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];

    if (!file) {
        selectedImage = "";
        imagePreview.innerHTML = "";
        hideSuggestedPrompts();
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        imageInput.value = "";
        return;
    }

    selectedImage = "";
    conversationHistory = [];
    chatBox.innerHTML = "";

    hideSuggestedPrompts();

    const imageUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    imagePreview.innerHTML = "";

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "Selected image";

    imagePreview.appendChild(image);

    

    makeImageClickable(image);
    const removeImageButton = document.createElement("button");
    removeImageButton.textContent = "✕ Remove Image";
    removeImageButton.className = "remove-image-button";

    removeImageButton.addEventListener("click", function () {
        selectedImage = "";
        imagePreview.innerHTML = "";
        imageInput.value = "";

        hideSuggestedPrompts();
    });

    imagePreview.appendChild(removeImageButton);

    reader.onload = function () {
        const img = new Image();

        img.onload = function () {
            const canvas = document.createElement("canvas");

            canvas.width = img.width;
            canvas.height = img.height;

            canvas.getContext("2d").drawImage(img, 0, 0);

            selectedImage = canvas.toDataURL("image/jpeg", 0.85);

            showSuggestedPrompts();
        };

        img.onerror = function () {
            alert("Unable to process this image.");
            selectedImage = "";
        };

        img.src = reader.result;
    };

    reader.onerror = function () {
        alert("Unable to read the selected image.");
        selectedImage = "";
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

    chatBox.scrollTop = chatBox.scrollHeight;

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

        loadingMessage.innerHTML =
            "AI: " + DOMPurify.sanitize(marked.parse(answer));

        


        loadingMessage.querySelectorAll("img").forEach(function (image) {
            makeImageClickable(image);
        });

        const copyButton = document.createElement("button");

        copyButton.textContent = "📋 Copy Response";
        copyButton.className = "copy-button";

        copyButton.addEventListener("click", async function () {
            try {
                await navigator.clipboard.writeText(answer);

                copyButton.textContent = "✓ Copied!";

                setTimeout(function () {
                    copyButton.textContent = "📋 Copy Response";
                }, 2000);

            } catch (error) {
                alert("Unable to copy response.");
            }
        });

        loadingMessage.appendChild(copyButton);

    } catch (error) {
        console.error("Image analysis failed:", error);

        loadingMessage.textContent = "AI Error: " + error.message;

    } finally {
        sendButton.disabled = false;
        messageInput.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}



sendButton.addEventListener("click", sendMessage);



messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
