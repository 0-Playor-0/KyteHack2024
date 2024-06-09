import express from "express"
import { z } from "zod"
import { openai, parse, save } from "../core.js"
import { whoami } from "./auth.js"

const router = express.Router()

const chatSchema = z.object({
    message: z.string().trim().min(1, { message: "That's not a message!" }).max(1000, { message: "That message is too long!" })
})

router.get("/chat", (req, res) => {
    const data = whoami(req.cookies.token)
    if (data) res.status(200).json(data.msgs).end()
    else res.status(401).end("Not logged in...")
})

async function gimmme(url, input) {
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            StringInput: input
        })
    })

    if (resp.status === 200) {
        return JSON.parse(`{${(await resp.text()).slice(1, -3)
            .toLowerCase()
            .split("\\n")
            .map(i => {
            const [h, j] = i.split(": ")
            return `"${h}": ${j}`
        }).join(",")}}`)
    } else {
        const respData = await resp.text()
        throw new Error(`${resp.status}: ${respData}`)
    }
}

const APIS = ["https://fcf4-34-16-163-244.ngrok-free.app/feeling_pred", "https://75d2-34-90-6-167.ngrok-free.app/feeling_pred"]

router.post("/chat", async (req, res) => {
    const userData = whoami(req.cookies.token)
    if (!userData) {
        res.status(401).end("Not logged in...")
        return
    }

    const data = parse(chatSchema, req.body, res)
    if (!data) return

    const { message } = data

    try {
        // Keep last 10 messages (9 from previous, 1 from now)
        const out = userData.msgs.slice(-9).map(({ msg }) => ({
            role: "user",
            content: msg
        })).concat({ 
            role: "user",
            content: message
        })

        const [emo, tox, chat] = await Promise.all([
            ...APIS.map(i => gimmme(i, message)),
            openai.chat.completions.create({
                messages: [{
                    role: "system",
                    content: "Act as a therapist for people who may be struggling with mental health problems."
                }, ...out],
                model: "gpt-3.5-turbo"
            })
        ])

        const botmsg = chat.choices.find(i => i.finish_reason === "stop")?.message.content ?? ""

        userData.msgs.push({
            msg: message,
            botmsg,
        })
        userData.stats.push({
            ...emo,
            ...tox
        })
        await save()
        res.status(200).end("Message sent!")
    } catch (e) {
        console.error(e)
        res.status(500).end("Something went wrong...")
    }
})

router.get("/report", (req, res) => {
    const userData = whoami(req.cookies.token)
    if (userData) res.status(200).json(userData.stats)
    else res.status(401).end("Not logged in...")
})

export default router