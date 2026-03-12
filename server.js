import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"
import fs from "fs"
import hnswlib from "hnswlib-node"
import rateLimit from "express-rate-limit"

dotenv.config()

const { HierarchicalNSW } = hnswlib

const app = express()

app.use(express.json())

// Allowed domains
const allowedOrigins = [
  "https://trifectaky.com",
  "http://localhost",
  "http://localhost:3000"
]

// CORS protection
app.use(
  cors({
    origin: function (origin, callback) {

      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"))
      }

      return callback(null, true)
    }
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many requests. Please slow down."
})

app.use("/chat", limiter)

// Serve widget.js
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
    const history = req.body.history || []
    const pageUrl = req.body.pageUrl
    const pageTitle = req.body.pageTitle

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
You are the AI assistant for Trifecta, a web design and digital marketing agency.

Your goals are:

1. Help visitors understand Trifecta's services.
2. Answer questions using the website context.
3. If a visitor expresses interest in a project, politely ask if they would like someone from the team to reach out.

If they say yes, collect:

Name
Email
Brief project description

Be conversational, friendly, and helpful.

The visitor is currently on this page:

Title: ${pageTitle}
URL: ${pageUrl}

Context:
${context}
`
        },

        ...history,

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