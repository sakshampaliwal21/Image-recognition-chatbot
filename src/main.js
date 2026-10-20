
require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile("src/index.html");
}

ipcMain.handle("ask-image", async (event, data) => {
    try {
        if (!data || !data.question || !data.image) {
            throw new Error("Image and question are required.");
        }

        const historyMessages = Array.isArray(data.history)
            ? data.history
                .filter(message =>
                    message &&
                    ["user", "assistant"].includes(message.role) &&
                    typeof message.content === "string"
                )
                .map(message => ({
                    role: message.role,
                    content: message.content
                }))
            : [];

        const response = await groq.chat.completions.create({
            model: "qwen/qwen3.8-27b",
            messages: [
                ...historyMessages,
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: data.question
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: data.image
                            }
                        }
                    ]
                }
            ]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Groq error:", error.message);

        throw new Error(
            "Could not analyze the image. Check your Groq API key and try again."
        );
    }
});

app.whenReady().then(createWindow);
