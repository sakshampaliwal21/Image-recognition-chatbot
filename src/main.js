const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config({
    path: path.join(app.getAppPath(), ".env")});

let groq;
function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false}});

    win.loadFile(path.join(__dirname, "index.html"));
    win.webContents.on("did-fail-load", (_event, code, description) => {
        console.error("Window failed to load:", code, description);
    });
}
app.whenReady().then(async () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        await dialog.showMessageBox({
            type: "error",
            title: "Missing API Key",
            message: "The Groq API key was not found.",
            detail:
                "For development, add GROQ_API_KEY to your project's .env file. " +
                "For a distributed app, configure a secure API-key setup instead of " +
                "bundling your personal key." });
        app.quit();
        return;}

    groq = new Groq({ apiKey });
    createWindow();
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && groq) {
        createWindow();}});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();}});
ipcMain.handle("ask-image", async (_event, data) => {
    try {if (!data || !data.question || !data.image) {
            throw new Error("Image and question are required.");}

        const historyMessages = Array.isArray(data.history)
            ? data.history
                .filter(message =>
                    message &&
                    ["user", "assistant"].includes(message.role) &&
                    typeof message.content === "string" )
                .map(message => ({
                    role: message.role,
                    content: message.content
                })): [];

        const response = await groq.chat.completions.create({
            model: "qwen/qwen3.8-27b",
            max_tokens: 800,
            messages: [...historyMessages,
                {role: "user",
                    content: [
                        { type: "text",
                            text: data.question},
                        {type: "image_url",
                            image_url: {
                                url: data.image }}] }] });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Groq error:", error);

        throw new Error(
            "Could not analyze the image. Check your API key, connection, and image.");}});
