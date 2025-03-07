import { serve } from '@hono/node-server'
import dotenv from 'dotenv'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import Whatsapp from './services/whatsapp/index.js'
import pages from './pages.js'
import OpenAI from 'openai'

dotenv.config()

const app = new Hono()
const whatsapp = new Whatsapp()

app.use(logger())
app.use(secureHeaders())
app.route('/api/webhooks/meta/whatsapp', whatsapp.webhooks())

// Pages
app.route('/', pages)

whatsapp.onMessage(async ({ messages }) => {
  if(messages && messages[0] && messages[0].text){ 
    // Prompt the ai
    const text = messages[0].text.body
    const openai = new OpenAI()
    const completation = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `${text}`
        }
      ]
    })
    
    // Send back the response
    const response = completation.choices[0];
    whatsapp.messages.text({
      from: '574709005728246',
      to: messages[0].from,
      text: response.message.content!,
    })

    // Test interactive list modal message
    whatsapp.messages.modalChoices({
      from: '574709005728246',
      to: messages[0].from,
      title: "Order",
      description: "Order a new product now",
      buttonText: "Choose",
      sections: [
        {
          title: "Section 1",
          rows: [
            { id: "choice1", title: "Choice 1", description: "This is the first choice" },
            { id: "choice2", title: "Choice 2", description: "This is the second choice" },
            { id: "choice3", title: "Choice 3", description: "This is the third choice" },
          ]
        },
        {
          title: "Section 2",
          rows: [
            { id: "choice1", title: "Choice 1", description: "This is the first choice" },
            { id: "choice2", title: "Choice 2", description: "This is the second choice" },
            { id: "choice3", title: "Choice 3", description: "This is the third choice" },
          ]
        },
      ]
    })

    // Test interactive reply button message
    whatsapp.messages.replyChoices({
      from: "574709005728246",
      to: messages[0].from,
      header: {text: "Make your choice"},
      text: "This is your chance to make your choice",
      choices: [
        {id: "c1", title: "First Choice"},
        {id: "c2", title: "Second Choice"},
        {id: "c3", title: "Third Choice"},
      ]
    })
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
