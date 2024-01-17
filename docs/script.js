(function () {
    const chatInput = document.querySelector("#chat-input");
    const sendButton = document.querySelector("#send-btn");
    const chatContainer = document.querySelector(".chat-container");
    const themeButton = document.querySelector("#theme-btn");
    const deleteButton = document.querySelector("#delete-btn");

    let userPrompt = null;

    function loadDataFromLocalStorage() {
        const themeColor = localStorage.getItem("themeColor");
        document.body.classList.toggle("light-mode", themeColor === "light_mode");
        themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

        const defaultText = `
        <div class="default-text">
            <img src="images/chatbot.png" alt="chatbot-img">
            <h1>CienteGPT</h1>
            <p>GPT treinado com base no "DIO ESG Impact Report 2023".</p>
            <p><strong>Esteja ciente de que este LLM também sabe muito sobre o Pablito 😘</strong></p>
            <br>
            <h4>Perguntas Sugeridas:</h4>
            <p class="suggested-question">Quais são as conquistas destacadas no relatório de impacto social da DIO?</p>
            <p class="suggested-question">Quais são os compromissos feitos no Fórum Econômico Mundial 2023?</p>
            <p class="suggested-question">Como a DIO está abordando a desigualdade de gênero no mercado de tecnologia?</p>
            <p class="suggested-question">Uma curiosidade sobre Pablo Zaniolo?</p>
            <p class="suggested-question">Me diga tudo o que sabe sobre o Pablo?</p>
        </div>`;

        chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
        chatContainer.scrollTo(0, chatContainer.scrollHeight);

        document.querySelectorAll('.suggested-question').forEach(p => {
            p.addEventListener('click', function () {
                chatInput.value = this.textContent;
            });
        });
    }

    function createChatElement(content, className) {
        const chatDiv = document.createElement("div");
        chatDiv.classList.add("chat", className);
        chatDiv.innerHTML = content;
        return chatDiv;
    }

    async function getChatResponse(incomingChatDiv) {
        const API_URL = "https://api.askyourpdf.com/v1/api/knowledge_base_chat";
        const pElement = document.createElement("p");

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "ask_0d86a08f64504c655d2ea27a12c13411"
            },
            body: JSON.stringify({
                documents: [
                    "01f0462e-69c7-4856-8f9b-9a0a1469de4e",
                    "0c1c0cd5-8fa8-4920-aabf-ded5cd214ab4",
                    "3eb0d5a3-ce6d-4923-8fec-a1d01d3b609e"
                ],
                messages: [
                    {
                        sender: "user",
                        message: userPrompt
                    }
                ]
            })
        };

        try {
            const response = await (await fetch(API_URL, requestOptions)).json();
            if (response.answer && response.answer.type === "response") {
                pElement.textContent = response.answer.message;
            } else {
                throw new Error("Resposta não está no formato esperado.");
            }
        } catch (error) {
            pElement.classList.add("error");
            pElement.textContent = "Oops! Algo deu errado ao recuperar a resposta. Por favor, tente novamente.";
        }

        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }

    function copyResponse(copyBtn) {
        const reponseTextElement = copyBtn.parentElement.querySelector("p");
        navigator.clipboard.writeText(reponseTextElement.textContent);
        copyBtn.textContent = "done";
        setTimeout(() => copyBtn.textContent = "content_copy", 1000);
    }

    function showTypingAnimation() {
        const html = `<div class="chat-content">
                        <div class="chat-details">
                            <img src="images/chatbot_message.png" alt="chatbot-img">
                            <div class="typing-animation">
                                <div class="typing-dot" style="--delay: 0.2s"></div>
                                <div class="typing-dot" style="--delay: 0.3s"></div>
                                <div class="typing-dot" style="--delay: 0.4s"></div>
                            </div>
                        </div>
                        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                    </div>`;
        const incomingChatDiv = createChatElement(html, "incoming");
        chatContainer.appendChild(incomingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        getChatResponse(incomingChatDiv);
    }

    function handleOutgoingChat() {
        userPrompt = chatInput.value.trim();
        if (!userPrompt) return;

        chatInput.value = "";

        const html = `<div class="chat-content">
                        <div class="chat-details">
                            <img src="images/user.svg" alt="user-img">
                            <p>${userPrompt}</p>
                        </div>
                    </div>`;
        const outgoingChatDiv = createChatElement(html, "outgoing");
        chatContainer.querySelector(".default-text")?.remove();
        chatContainer.appendChild(outgoingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        setTimeout(showTypingAnimation, 500);
    }

    deleteButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all the chats?")) {
            localStorage.removeItem("all-chats");
            loadDataFromLocalStorage();
        }
    });

    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        localStorage.setItem("themeColor", themeButton.innerText);
        themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    });

    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${initialInputHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleOutgoingChat();
        }
    });

    loadDataFromLocalStorage();
    sendButton.addEventListener("click", handleOutgoingChat);
})();
