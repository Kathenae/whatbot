export interface BaseMessage {
    type: unknown,
    from: string
    to: string,
}

interface TextMessage extends BaseMessage {
    type: 'text',
    text: string,
}

interface interactiveMessage extends BaseMessage {
    type: 'interactive',
    modal_title: string,
    modal_description: string,
    action_text: string,
    choice_sections: {
        title: string, 
        rows: {
            id: string,
            title: string,
            description: string,
        }[]
    }[]
}

export type Message = TextMessage | interactiveMessage