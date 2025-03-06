import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { Message } from './types.js'
import webhooks from './webhooks.js'
import EventEmitter from 'node:events'


export default class Whatsapp {
    private events = new EventEmitter()
    private api : AxiosInstance

    constructor() {
        this.api = axios.create(axios.defaults)
        const BASE_URL = 'https://graph.facebook.com/v22.0'
        const AUTH_TOKEN = process.env.META_ACCESS_TOKEN
        this.api.defaults.baseURL = BASE_URL
        this.api.defaults.headers.common.Authorization = `Bearer ${AUTH_TOKEN}`
    }

    async message(message: Message) {

        let response: Response | null = null
    
        const endpoint = `/${message.from}/messages`
        const common_data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.to,
        }
    
        if(message.type == 'text'){
            response = await this.api.post(endpoint, {
                ...common_data,
                text: {
                    preview_url: true,
                    body: message.text
                }
            })
        }
    
        if(message.type == 'interactive') {
            response = await this.api.post(endpoint, {
                ...common_data,
                type: "interactive",
                interactive: {
                    type: "list",
                    header: {
                        type: "text",
                        text: message.modal_title,
                    },
                    body: {
                        text: message.modal_description
                    },
                    action: {
                        button: message.action_text,
                        sections: message.choice_sections,
                    }
                }
            })
        }
    
        if(response == null) {
            throw new Error("INVALID_MESSAGE_TYPE")
        }
    
        if(response.status !== 200) {
            throw new Error("API_ERROR")
        }
    
        return response;
    }

    on(event: string, listener: (...args: any[]) => void) {
        this.events.on(event, listener)
    }

    webhooks() {
        return webhooks(this.events, {
            verification_token: process.env.WEBHOOK_VERIFICATION_TOKEN!,
            app_secret: process.env.META_APP_SECRET!
        })
    }
}