import express from "express"
import { z } from "zod"
import { data, parse, save, env } from "../core.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router()

const userSchema = z.object({
    name: z.string().trim().min(1, { message: "Username can't be an empty string!" }).max(128, { message: "Username is too long!" }),
    pwd: z.string().trim().min(1, { message: "Password can't be an empty string!" }).max(128, { message: "Password is too long!" }),
});

router.post("/create", async (req, res) => {
    const user = parse(userSchema, req.body, res)
    if (!user) return

    const { name, pwd } = user

    if (name in data) res.status(403).end("User already exists")
    else {
        const pass = await bcrypt.hash(pwd, 10)
        data[name] = {
            pass,
            msgs: [],
            stats: []
        }
        await save()
        res.status(200).end("User created!")
    }
})

const COOKIE_OPTIONS = {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "Lax"
}
router.post("/login", async (req, res) => {
    const user = parse(userSchema, req.body, res)
    if (!user) return

    const { name, pwd } = user
    if (name in data) {
        const works = await bcrypt.compare(pwd, data[name].pass)
        if (works) {
            // Add anything else?
            const token = jwt.sign({ name }, env.AUTH_SECRET)
            res.cookie("token", token, {
                ...COOKIE_OPTIONS,
                maxAge: 1000 * 60 * 60 * 24,
            }).status(200).end("Logged in!")
        }
        else res.status(403).end("Wrong password")
    } else res.status(403).end("User doesn't exist")
})

router.post("/logout", (_, res) => {
    res.clearCookie('token', COOKIE_OPTIONS).status(200).end("Logged out!")
})

export function whoami(token) {
    try {
        const decoded = jwt.verify(token, env.AUTH_SECRET)
        return data[decoded.name]
    } catch (e) {
        // Might be bad token, might be bad programming
        console.error(e)
        return null
    }
}
export default router