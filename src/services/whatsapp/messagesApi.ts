import type { AxiosInstance } from "axios";

export interface BaseMessage {
    from: string
    to: string,
}

export interface TextMessage extends BaseMessage {
    text: string,
}

export interface interactiveMessage extends BaseMessage {
    modalTitle: string,
    modalDescription: string,
    buttonText: string,
    choices: {
        title: string,
        rows: {
            id: string,
            title: string,
            description: string,
        }[]
    }[]
}

interface MediaMessage extends BaseMessage {
    caption: string
    mediaId?: string
    mediaLink?: string
}

export default class MessagesAPI {
    private client: AxiosInstance

    constructor(client: AxiosInstance) {
        this.client = client
    }

    private async send(from: string, to: string, message: any) {
        const common_data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
        }
        const response = await this.client.post(`/${from}/messages`, {
            ...common_data,
            ...message,
        })
        return response
    }

    async text(message: TextMessage) {
        const response = await this.send(message.from, message.to, {
            type: "text",
            text: {
                preview_url: true,
                body: message.text
            }
        })
        return response;
    }

    async interactive(message: interactiveMessage) {
        const response = await this.send(message.from, message.to, {
            type: "interactive",
            interactive: {
                type: "list",
                header: {
                    type: "text",
                    text: message.modalTitle,
                },
                body: {
                    text: message.modalDescription
                },
                action: {
                    button: message.buttonText,
                    sections: message.choices,
                }
            }
        })
        return response;
    }

    private async sendMediaMessage(type: string, message: MediaMessage) {
        let media: any = {
            caption: message.caption
        }

        if (message.mediaId) {
            media.id = message.mediaId
        } else if (message.mediaLink) {
            media.link = message.mediaLink
        }

        return await this.send(message.from, message.to, {
            type: type,
            [type]: media
        })
    }

    async audio(message: MediaMessage) {
        return await this.sendMediaMessage('audio', message)
    }

    async video(message: MediaMessage) {
        return await this.sendMediaMessage('video', message)
    }

    async image(message: MediaMessage) {
        return await this.sendMediaMessage('image', message)
    }

    async document(message: MediaMessage) {
        return await this.sendMediaMessage('document', message)
    }
}