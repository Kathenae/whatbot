import { createHmac } from "crypto";

export function signSHA256(payload: string, secret: string, encoding: 'hex' | 'base64' | 'base64url' | 'binary' = 'hex') {
    return createHmac('sha256', secret).update(payload).digest(encoding);
}