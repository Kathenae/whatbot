import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono()
app.use('*', serveStatic({ root: './public'}))
export default app;