import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import OpenAI from "openai"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/*
LOAD KNOWLEDGE BASE FILES
*/

function loadKnowledgeBase() {

  const knowledgeFolder = path.join(process.cwd(), "knowledge")

  const files = fs.readdirSync(knowledgeFolder)

  let knowledgeText = ""

  files.forEach(file => {

    const content = fs.readFileSync(
      path.join(knowledgeFolder, file),
      "utf8"
    )

    knowledgeText += `\n\n${content}`
  })

  return knowledgeText
}

const knowledgeBase = loadKnowledgeBase()

/*
SYSTEM PROMPT
*/

const systemPrompt = `
You are the website assistant for Trifecta, a digital agency.

Your job is to help website visitors understand Trifecta's services and guide them toward contacting the team.

Guidelines:

• Be helpful and professional
• Keep answers concise
• Only use the information in the knowledge base
• Do not invent information
• If unsure, recommend contacting Trifecta

If a visitor asks about pricing or starting a project, suggest contacting the Trifecta team.

Here is the knowledge base:

${knowledgeBase}
`

/*
CHAT ENDPOINT
*/

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: systemPrompt
        },

        {
          role: "user",
          content: userMessage
        }

      ]

    })

    const reply = completion.choices[0].message.content

    res.json({
      reply
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: "Something went wrong"
    })

  }

})

/*
START SERVER
*/

const PORT = 3000

app.listen(PORT, () => {

  console.log(`Chatbot server running on port ${PORT}`)

})