import express from "express"
import auth from "./routes/auth.js"
import chat from "./routes/chat.js"
import cookieParser from "cookie-parser"
import { join } from "path"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.disable("x-powered-by")

app.use(auth)
app.use(chat)

function pathTo(file) {
    return join(import.meta.dirname, `../frontend/${file}.html`)
}

app.get("/", (req, res) => {
    if (!req.cookies.token) res.redirect("/login")
    else res.sendFile(pathTo("index"))
})

app.get("/calendar", (req, res) => {
    if (!req.cookies.token) res.redirect("/login")
    else res.sendFile(pathTo("calendar"))
})

app.get("/login", (req, res) => {
    if (req.cookies.token) res.redirect("/")
    else res.sendFile(pathTo("login"))
})

app.get("/signup", (req, res) => {
    if (req.cookies.token) res.redirect("/")
    else res.sendFile(pathTo("signup"))
})

app.listen(3000, () => {
    console.log("Running!!!")
})