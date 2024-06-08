import express from "express"
import auth from "./routes/auth.js"

const app = express()

app.use(express.json())
app.use(auth)
app.use(express.static("root/frontend"))

app.listen(3000, () => {
    console.log("Running!!!")
})