import dotenv from "dotenv"
dotenv.config()

import fs from "fs"
import OpenAI from "openai"
import hnswlib from "hnswlib-node"

const { HierarchicalNSW } = hnswlib

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const dimension = 1536

async function buildVectors() {

  console.log("Building vector database...")

  const files = fs.readdirSync("./knowledge")

  let texts = []

  for (const file of files) {

    const content = fs.readFileSync(`./knowledge/${file}`, "utf8")

    texts.push(content)

  }

  console.log(`Loaded ${texts.length} files`)

  const index = new HierarchicalNSW("cosine", dimension)

  index.initIndex(texts.length)

  for (let i = 0; i < texts.length; i++) {

    console.log(`Embedding ${i + 1} of ${texts.length}`)

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts[i]
    })

    const vector = embedding.data[0].embedding

    index.addPoint(vector, i)

  }

  index.writeIndexSync("vector-db.bin")

  fs.writeFileSync(
    "vector-db-texts.json",
    JSON.stringify(texts, null, 2)
  )

  console.log("Vector database built successfully!")

}

buildVectors()