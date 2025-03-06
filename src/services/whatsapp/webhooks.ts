import { Hono } from "hono";
import { signSHA256 } from "../../utils.js";
import type EventEmitter from "events";
import type { WhatsappWebhookPayload } from "./types.js";

export default function webhooks(emitter: EventEmitter, options: {verification_token: string, app_secret: string}) {

    const router = new Hono()

    // webhook subscription verification middleware. see: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
    router.use(async (c, next) => {
        if(c.req.method !== 'GET') {
            return next()
        }

        // Verify the token
        const verify_token = c.req.query('hub.verify_token')
        if(verify_token !== options.verification_token ) {
            c.status(403)
            return c.json({message: 'Invalid verification token. Subscription failed'})
        }

        const challenge_code = c.req.query('hub.challenge')
        c.status(200)
        return c.text(`${challenge_code}`)
    })

    // Webhook notification payload validation middleware
    router.use(async (c, next) => {
        
        // Not a webhook POST request.
        if(c.req.method !== 'POST') {
            return next()
        }

        const requestSignature = c.req.header('X-Hub-Signature-256')
        const payload = await c.req.text()
        if(!requestSignature) {
            c.status(400)
            return c.json({ message: "No signature provided" })
        }

        const trustedSignature = `sha256=${signSHA256(payload, options.app_secret)}`
        if (trustedSignature !== requestSignature) {
            c.status(403)
            return c.json({ message: "Payload signature is invalid" })
        }

        return next()
    })

    router.post('/', async (c, next) => {
        const payload : WhatsappWebhookPayload = await c.req.json()
        
        for(let entry of payload.entry) {
            for(let change of entry.changes) {
                emitter.emit(change.field, change.value)
            }
        }

        return c.text('Thanks for the update!')
    })

    return router
}