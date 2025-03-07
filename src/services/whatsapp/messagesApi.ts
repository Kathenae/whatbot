import type { AxiosInstance } from "axios";

export interface BaseMessage {
    from: string
    to: string,
}

export interface TextMessage extends BaseMessage {
    text: string,
}

export interface ModalChoicesMessage extends BaseMessage {
    title: string,
    description: string,
    buttonText: string,
    sections: {
        title: string,
        rows: {
            id: string,
            title: string,
            description: string,
        }[]
    }[]
}

type Media = { id: string, link?: never } | { id?: never, link: string }

export interface ReplyChoicesMessage extends BaseMessage {
    
    /**
     * @property provide either the text, document, image or video
     */
    header: (
        {document: Media, image?: never, text?: never, video?: never} |
        {image: Media, document?: never, text?: never, video?: never} |
        {text: string, document?: never, image?: never, video?: never} |
        {video: Media, document?: never, image?: never, text?: never}
    ),
    text: string,
    choices: {
        id: string,
        title: string,
    }[]
}

type MediaMessage = BaseMessage & Media & {
    caption: string
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

    async modalChoices(message: ModalChoicesMessage) {
        const response = await this.send(message.from, message.to, {
            type: "interactive",
            interactive: {
                type: "list",
                header: {
                    type: "text",
                    text: message.title,
                },
                body: {
                    text: message.description
                },
                action: {
                    button: message.buttonText,
                    sections: message.sections,
                }
            }
        })
        return response;
    }

    async replyChoices(message: ReplyChoicesMessage) {
        await this.send(message.from, message.to, {
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    ...message.header,
                    type: message.header.text? "text" : message.header.document? "document" : message.header.image? "image" : "video"
                },
                body: {
                    text: message.text
                },
                action: {
                    buttons: message.choices.map((choice) => ({
                        type: "reply",
                        reply: {
                            id: choice.id,
                            title: choice.title
                        }
                    }))
                }
            }
        })
    }


    private async sendMediaMessage(type: string, message: MediaMessage) {
        let media: any = {
            caption: message.caption
        }

        if (message.id) {
            media.id = message.id
        } else if (message.link) {
            media.link = message.link
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