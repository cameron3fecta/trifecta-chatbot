(function () {

  let conversationHistory = []

  const button = document.createElement("div")
  button.id = "chatbot-button"
  button.innerHTML = "💬"

  document.body.appendChild(button)

  const chatbot = document.createElement("div")
  chatbot.id = "trifecta-chatbot"

  chatbot.innerHTML = `
    <div id="chatbot-header">
      Trifecta Assistant
      <span id="chatbot-close">✕</span>
    </div>

    <div id="chatbot-messages"></div>

    <div id="chatbot-input-area">
      <input id="chatbot-input" placeholder="Ask us anything..." />
      <button id="chatbot-send">Send</button>
    </div>
  `

  document.body.appendChild(chatbot)

  const style = document.createElement("style")

  style.innerHTML = `

  #chatbot-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: black;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    cursor: pointer;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  #trifecta-chatbot {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 340px;
    height: 440px;
    background: white;
    border-radius: 10px;
    border: 1px solid #ddd;
    display: none;
    flex-direction: column;
    font-family: Arial;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    z-index: 999999;
  }

  #chatbot-header {
    background: black;
    color: white;
    padding: 10px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }

  #chatbot-close {
    cursor: pointer;
  }

  #chatbot-messages {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    font-size: 14px;
  }

  .chatbot-message {
    margin-bottom: 12px;
  }

  .user {
    text-align: right;
    font-weight: bold;
  }

  .bot {
    text-align: left;
  }

  #chatbot-input-area {
    display: flex;
    border-top: 1px solid #ddd;
  }

  #chatbot-input {
    flex: 1;
    padding: 10px;
    border: none;
    outline: none;
  }

  #chatbot-send {
    padding: 10px;
    border: none;
    background: black;
    color: white;
    cursor: pointer;
  }

  `

  document.head.appendChild(style)

  const messages = document.getElementById("chatbot-messages")

  function addMessage(text, sender) {

    const div = document.createElement("div")

    div.className = "chatbot-message " + sender

    div.innerText = text

    messages.appendChild(div)

    messages.scrollTop = messages.scrollHeight
  }

  async function sendMessage() {

    const input = document.getElementById("chatbot-input")

    const message = input.value

    if (!message) return

    addMessage(message, "user")

    conversationHistory.push({
      role: "user",
      content: message
    })

    input.value = ""

    const response = await fetch(
      "https://trifecta-chatbot.onrender.com/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          history: conversationHistory,
          pageUrl: window.location.href,
          pageTitle: document.title
        })
      }
    )

    const data = await response.json()

    addMessage(data.reply, "bot")

    conversationHistory.push({
      role: "assistant",
      content: data.reply
    })

  }

  document
    .getElementById("chatbot-send")
    .addEventListener("click", sendMessage)

  button.onclick = () => {
    chatbot.style.display = "flex"
    button.style.display = "none"
  }

  document
    .getElementById("chatbot-close")
    .onclick = () => {
      chatbot.style.display = "none"
      button.style.display = "flex"
    }

})()