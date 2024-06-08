import express from "express"
import { z } from "zod"
import { parse, save } from "../core.js"
import { whoami } from "./auth.js"

const router = express.Router()

const chatSchema = z.object({
    message: z.string().trim().min(1, { message: "That's not a message!" }).max(4000, { message: "That message is too long!" })
})

router.get("/chat", (req, res) => {
    const data = whoami(req.cookies.token)
    if (data) res.status(200).json(data.msgs).end()
    else res.status(401).end("Not logged in...")
})

router.post("/chat", async (req, res) => {
    const userData = whoami(req.cookies.token)
    if (!userData) {
        res.status(401).end("Not logged in...")
        return
    }

    const data = parse(chatSchema, req.body, res)
    if (!data) return

    const { message } = data
    userData.msgs.push(message)
    await save()
    res.status(200).end("Message sent!")
})

export default router