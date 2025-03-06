import { serve } from '@hono/node-server'
import dotenv from 'dotenv'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import Whatsapp from './services/whatsapp/index.js'
import pages from './pages.js'
import type { WhatsappMessageEvent } from './services/whatsapp/types.js'

dotenv.config()

const app = new Hono()
const whatsapp = new Whatsapp()

app.use(logger())
app.use(secureHeaders())
app.route('/api/webhooks/meta/whatsapp', whatsapp.webhooks())

// Pages
app.route('/', pages)

whatsapp.on('messages', ({ messages }: WhatsappMessageEvent) => {

  if(messages && messages[0] && messages[0].text){ 
    whatsapp.message({
      type: 'text',
      from: '574709005728246',
      to: messages[0].from,
      text: messages[0].text.body,
    })
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
