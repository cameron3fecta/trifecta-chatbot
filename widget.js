const API_URL = "https://trifecta-chatbot.onrender.com/chat"

let chatHistory = []

// Create floating button
const button = document.createElement("div")
button.innerHTML = "💬"

button.style.position = "fixed"
button.style.bottom = "20px"
button.style.right = "20px"
button.style.width = "60px"
button.style.height = "60px"
button.style.borderRadius = "50%"
button.style.background = "#e14f25"
button.style.color = "white"
button.style.display = "flex"
button.style.alignItems = "center"
button.style.justifyContent = "center"
button.style.fontSize = "24px"
button.style.cursor = "pointer"
button.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)"
button.style.zIndex = "9999"

document.body.appendChild(button)


// Create chat window
const chat = document.createElement("div")

chat.style.position = "fixed"
chat.style.bottom = "90px"
chat.style.right = "20px"
chat.style.width = "340px"
chat.style.height = "460px"
chat.style.background = "white"
chat.style.borderRadius = "10px"
chat.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)"
chat.style.display = "none"
chat.style.flexDirection = "column"
chat.style.overflow = "hidden"
chat.style.zIndex = "9999"

document.body.appendChild(chat)


// Header
const header = document.createElement("div")
header.innerHTML = "Trifecta Assistant"

header.style.background = "#037f74"
header.style.color = "white"
header.style.padding = "12px"
header.style.fontWeight = "bold"
header.style.fontFamily = "Arial"

chat.appendChild(header)


// Messages container
const messages = document.createElement("div")

messages.style.flex = "1"
messages.style.padding = "10px"
messages.style.overflowY = "auto"
messages.style.fontFamily = "Arial"
messages.style.background = "rgb(51 51 51 / 5%)"

chat.appendChild(messages)


// Input container
const inputContainer = document.createElement("div")

inputContainer.style.display = "flex"
inputContainer.style.borderTop = "1px solid #ddd"

chat.appendChild(inputContainer)


// Input field
const input = document.createElement("input")

input.type = "text"
input.placeholder = "Ask us anything..."

input.style.flex = "1"
input.style.border = "none"
input.style.padding = "10px"
input.style.fontSize = "14px"

inputContainer.appendChild(input)


// Send button
const send = document.createElement("button")

send.innerHTML = "Send"

send.style.background = "#e14f25"
send.style.color = "white"
send.style.border = "none"
send.style.padding = "10px 16px"
send.style.cursor = "pointer"

inputContainer.appendChild(send)


// Toggle chat
button.onclick = () => {

  chat.style.display =
    chat.style.display === "none" ? "flex" : "none"

}


// Add message
function addMessage(text, sender) {

  const msg = document.createElement("div")

  msg.innerText = text

  msg.style.marginBottom = "8px"
  msg.style.padding = "8px"
  msg.style.borderRadius = "6px"
  msg.style.fontSize = "14px"
  msg.style.maxWidth = "80%"

  if (sender === "user") {

    msg.style.background = "#e14f25"
    msg.style.color = "white"
    msg.style.marginLeft = "auto"

  } else {

    msg.style.background = "#f1f1f1"
    msg.style.color = "#333"

  }

  messages.appendChild(msg)

  messages.scrollTop = messages.scrollHeight
}


// Send message
async function sendMessage() {

  const text = input.value.trim()

  if (!text) return

  addMessage(text, "user")

  chatHistory.push({
    role: "user",
    content: text
  })

  input.value = ""

  const res = await fetch(API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      message: text,
      history: chatHistory,
      pageUrl: window.location.href,
      pageTitle: document.title

    })

  })

  const data = await res.json()

  addMessage(data.reply, "bot")

  chatHistory.push({
    role: "assistant",
    content: data.reply
  })

}


// Click send
send.onclick = sendMessage


// PRESS ENTER SUPPORT
input.addEventListener("keypress", function(e) {

  if (e.key === "Enter") {

    sendMessage()

  }

})