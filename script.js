const API_KEY = "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";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const themeBtn = document.getElementById("themeBtn");
const statusText = document.getElementById("statusText");
const statusLabel = document.getElementById("statusLabel");
const avatar = document.querySelector(".avatar");

let conversationHistory = [
    { 
        role: "system", 
        content: "You are a friendly AI assistant. ALWAYS reply in Tanglish (Tamil typed in English letters) mixed with English. Example: 'Vanakkam bro! Enna help venum?'. NEVER reply in Tamil script (தமிழ் எழுத்து). Only use English letters. Be casual and friendly." 
    }
];

/* ============ STATUS FUNCTIONS ============ */
function setStatus(state) {
    // state = "online" | "typing"
    if (state === "typing") {
        statusText.classList.add("typing");
        statusLabel.textContent = "Typing...";
        avatar.classList.add("typing-active");
    } else {
        statusText.classList.remove("typing");
        statusLabel.textContent = "Online";
        avatar.classList.remove("typing-active");
    }
}

/* ============ THEME ============ */
function loadTheme() {
    const savedTheme = localStorage.getItem("chatbox-theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("chatbox-theme", isLight ? "light" : "dark");
});

loadTheme();

/* ============ MESSAGE FUNCTIONS ============ */
function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    msgDiv.innerHTML = `
        <div class="msg-avatar">${sender === "user" ? "👤" : "🤖"}</div>
        <div class="msg-content">${escapeHTML(text)}</div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message");
    typingDiv.id = "typingIndicator";
    typingDiv.innerHTML = `
        <div class="msg-avatar">🤖</div>
        <div class="typing"><span></span><span></span><span></span></div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
    const t = document.getElementById("typingIndicator");
    if (t) t.remove();
}

/* ============ AI RESPONSE ============ */
async function getAIResponse(userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: conversationHistory.slice(-10),
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Groq Error:", err);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: botReply });
        return botReply;

    } catch (error) {
        console.error("Error:", error);
        return "Sorry da, edho problem. Try again! 🙏";
    }
}

/* ============ SEND MESSAGE ============ */
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Send button click animation
    sendBtn.classList.add("clicked");
    setTimeout(() => sendBtn.classList.remove("clicked"), 600);

    addMessage(text, "user");
    userInput.value = "";
    sendBtn.disabled = true;

    // Status: Typing
    setStatus("typing");
    showTyping();

    const reply = await getAIResponse(text);

    removeTyping();
    addMessage(reply, "bot");

    // Status: Online
    setStatus("online");
    sendBtn.disabled = false;
    userInput.focus();
}

/* ============ EVENTS ============ */
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

clearBtn.addEventListener("click", () => {
    chatBox.innerHTML = `
        <div class="message bot-message">
            <div class="msg-avatar">🤖</div>
            <div class="msg-content">Vanakkam da! 😎 Enna help venum sollu!</div>
        </div>`;
    conversationHistory = [
        { 
            role: "system", 
            content: "You are a friendly AI assistant. ALWAYS reply in Tanglish (Tamil typed in English letters) mixed with English. NEVER reply in Tamil script. Only use English letters." 
        }
    ];
    setStatus("online");
});

userInput.focus();