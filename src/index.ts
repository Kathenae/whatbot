import { serve } from '@hono/node-server'
import dotenv from 'dotenv'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import whatsapp from './services/whatsapp/index.js'

dotenv.config()

const app = new Hono()

app.use(logger())
app.use(secureHeaders())

app.route('/api/webhooks/whatsapp', whatsapp.webhooks)

app.get('/send_text', async (c) => {
  const response = await whatsapp.sendMessage({
    type: 'text',
    from: "574709005728246",
    to: '258865447119',
    text: "Hello World"
  })
  return c.json(await response.json())
})

app.get('/send-interactive', async (c) => {
  const response = await whatsapp.sendMessage({
    type: 'interactive',
    from: "574709005728246",
    to: '258865447119',
    modal_title: "Choose an option",
    modal_description: "You can choose an option here today",
    action_text: 'Find out',
    choice_sections: [
      {
        title: "Section Title",
        rows: [
          {
            id: "c1",
            title: "Choice 1",
            description: "This is the choice 1",
          },
          {
            id: "c2",
            title: "Choice 2",
            description: "This is the choice 2",
          },
          {
            id: "c3",
            title: "Choice 3",
            description: "This is the choice 3",
          }
        ]
      }
    ]
  })
  return c.json(await response.json())
})

app.route('/api/webhook/whatsapp', whatsapp.webhooks)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
