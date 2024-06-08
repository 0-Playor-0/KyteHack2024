import express from "express"
import auth from "./routes/auth.js"
import chat from "./routes/chat.js"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(auth)
app.use(chat)
app.use(express.static("root/frontend"))

app.listen(3000, () => {
    console.log("Running!!!")
})