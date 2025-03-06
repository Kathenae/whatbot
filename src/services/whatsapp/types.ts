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

export type WhatsappWebhookPayload = {
    object: "whatsapp_business_account";
    entry: WhatsappEntry[];
};

type WhatsappEntry = {
    id: string;
    changes: WhatsappChange[];
};

type WhatsappChange = {
    value: WhatsappChangeValue;
    field: "messages";
};

type WhatsappChangeValue = {
    messaging_product: "whatsapp";
    metadata: {
        display_phone_number: string;
        phone_number_id: string;
    };
    contacts?: WhatsappContact[];
    messages?: WhatsappMessage[];
    statuses?: WhatsappMessageStatus[];
};

type WhatsappContact = {
    profile: {
        name: string;
    };
    wa_id: string;
};

type WhatsappMessage = {
    from: string;
    id: string;
    timestamp: string;
    type: "text" | "image" | "video" | "audio" | "document" | "sticker" | "location" | "interactive";
    text?: { body: string };
    image?: MediaMessage;
    video?: MediaMessage;
    audio?: MediaMessage;
    document?: MediaMessage;
    sticker?: MediaMessage;
    location?: LocationMessage;
    interactive?: InteractiveMessage;
};

type MediaMessage = {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
    filename?: string;
};

type LocationMessage = {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
};

type InteractiveMessage = {
    type: "button_reply" | "list_reply";
    button_reply?: {
        id: string;
        title: string;
    };
    list_reply?: {
        id: string;
        title: string;
        description?: string;
    };
};

type WhatsappMessageStatus = {
    id: string;
    recipient_id: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: string;
};

export type WhatsappMessageEvent = WhatsappChangeValue