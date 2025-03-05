import axios, { type AxiosResponse } from 'axios'
import type { Message } from './types.js'
import webhooks from './webhooks.js'

const BASE_URL = 'https://graph.facebook.com/v22.0'
const api = axios.create(axios.defaults)
api.defaults.baseURL = BASE_URL
api.defaults.headers.common.Authorization = `Bearer ${process.env.WHATSAPP_TOKEN}`

export async function sendMessage(message: Message) {

    let response: Response | null = null

    const endpoint = `/${message.from}/messages`
    const common_data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to,
    }

    if(message.type == 'text'){
        response = await api.post(endpoint, {
            ...common_data,
            text: {
                preview_url: true,
                body: message.text
            }
        })
    }

    if(message.type == 'interactive') {
        response = await api.post(endpoint, {
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

export default {
    sendMessage,
    webhooks
}