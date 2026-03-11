import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"
import fs from "fs"
import hnswlib from "hnswlib-node"

dotenv.config()

const { HierarchicalNSW } = hnswlib

const app = express()

app.use(cors())
app.use(express.json())

// allow serving widget.js
app.use(express.static("."))

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const dimension = 1536

console.log("Loading vector database...")

const index = new HierarchicalNSW("cosine", dimension)

index.readIndexSync("vector-db.bin")

const texts = JSON.parse(
  fs.readFileSync("vector-db-texts.json")
)

console.log("Vector database loaded")

app.get("/", (req, res) => {
  res.send("Trifecta Chatbot API is running")
})

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message
    const pageUrl = req.body.pageUrl
    const pageTitle = req.body.pageTitle

    console.log("User message:", userMessage)

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: userMessage
    })

    const queryVector = embedding.data[0].embedding

    const results = index.searchKnn(queryVector, 3)

    const context = results.neighbors
      .map(i => texts[i])
      .join("\n\n")

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: `
You are the AI assistant for Trifecta.

The visitor is currently on this page:

Title: ${pageTitle}
URL: ${pageUrl}

Use the context below to answer the user's question.

If the answer isn't clear, suggest contacting the Trifecta team.

Context:
${context}
`
        },

        {
          role: "user",
          content: userMessage
        }

      ]

    })

    const reply = completion.choices[0].message.content

    res.json({ reply })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: "Something went wrong"
    })

  }

})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`Chatbot server running on port ${PORT}`)
})