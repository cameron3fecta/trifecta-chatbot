(function () {

  const chatbot = document.createElement("div")
  chatbot.id = "trifecta-chatbot"

  chatbot.innerHTML = `
    <div id="chatbot-header">Trifecta Assistant</div>
    <div id="chatbot-messages"></div>
    <div id="chatbot-input-area">
      <input id="chatbot-input" placeholder="Ask us anything..." />
      <button id="chatbot-send">Send</button>
    </div>
  `

  document.body.appendChild(chatbot)

  const style = document.createElement("style")

  style.innerHTML = `
  #trifecta-chatbot {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    height: 420px;
    background: white;
    border-radius: 10px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    font-family: Arial;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 999999;
  }

  #chatbot-header {
    background: #000;
    color: white;
    padding: 10px;
    font-weight: bold;
  }

  #chatbot-messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    font-size: 14px;
  }

  .chatbot-message {
    margin-bottom: 10px;
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
          pageUrl: window.location.href,
          pageTitle: document.title
        })
      }
    )

    const data = await response.json()

    addMessage(data.reply, "bot")

  }

  document
    .getElementById("chatbot-send")
    .addEventListener("click", sendMessage)

})()