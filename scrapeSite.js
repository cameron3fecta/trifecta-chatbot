import axios from "axios"
import * as cheerio from "cheerio"
import fs from "fs"

const urls = [
  "https://trifectaky.com",
  "https://trifectaky.com/services",
  "https://trifectaky.com/about",
  "https://trifectaky.com/contact"
]

async function scrape() {

  let content = ""

  for (const url of urls) {

    console.log(`Scraping ${url}`)

    const res = await axios.get(url)

    const $ = cheerio.load(res.data)

    const text = $("body").text()

    content += `\n\nPAGE: ${url}\n\n${text}`
  }

  fs.writeFileSync("websiteContent.txt", content)

  console.log("Website content saved to websiteContent.txt")

}

scrape()