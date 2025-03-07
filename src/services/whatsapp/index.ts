import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import webhooks, { type WhatsappMessageEvent } from './webhooks.js'
import EventEmitter from 'node:events'
import MessagesAPI from './messagesApi.js'

export default class Whatsapp {
    private events = new EventEmitter()
    private client : AxiosInstance
    public messages: MessagesAPI

    constructor() {
        this.client = axios.create(axios.defaults)
        const BASE_URL = 'https://graph.facebook.com/v22.0'
        const AUTH_TOKEN = process.env.META_ACCESS_TOKEN
        this.client.defaults.baseURL = BASE_URL
        this.client.defaults.headers.common.Authorization = `Bearer ${AUTH_TOKEN}`
        
        this.messages = new MessagesAPI(this.client)
    }

    onMessage(listener: (data: WhatsappMessageEvent) => void) {
        this.events.on("messages", listener)
    }

    webhooks() {
        return webhooks(this.events, {
            verification_token: process.env.WEBHOOK_VERIFICATION_TOKEN!,
            app_secret: process.env.META_APP_SECRET!
        })
    }
}