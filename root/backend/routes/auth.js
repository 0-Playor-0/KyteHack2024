import express from "express"
import { z } from "zod"
import { data, parse, save, env } from "../core.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router()

const userSchema = z.object({
    name: z.string().trim().min(1, { message: "Username can't be an empty string!"}),
    pwd: z.string().trim().min(1, { message: "Password can't be an empty string!" }),
});

router.post("/create", async (req, res) => {
    const user = parse(userSchema, req, res)
    if (!user) return

    const { name, pwd } = user

    if (name in data) res.status(403).end("User already exists")
    else {
        const pass = await bcrypt.hash(pwd, 10)
        data[name] = {
            pass,
        }
        await save()
        res.status(200).end("User created!")
    }
})

router.post("/login", async (req, res) => {
    const user = parse(userSchema, req, res)
    if (!user) return

    const { name, pwd } = user
    if (name in data) {
        console.log(data, name)
        const works = await bcrypt.compare(pwd, data[name].pass)
        if (works) {
            // Add anything else?
            const token = jwt.sign({ name }, env.AUTH_SECRET)
            res.set({
                "Set-Cookie": `token=${token}; Max-Age=${1000 * 60 * 60 * 24}; HttpOnly; Path=/; SameSite=Lax; Secure`
            }).status(200).end("Logged in!")
        }
        else res.status(403).end("Wrong password")
    } else res.status(403).end("User doesn't exist")
})

export function whoami(token) {
    const decoded = jwt.verify(token, env.AUTH_SECRET)
    return data[decoded.name]
}
export default router