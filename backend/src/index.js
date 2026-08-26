import express from "express"
import "dotenv/config"
const app = express()

app.get("/", (req, res) => {
  res.send("Hello World from backend")  
})

app.listen(3000, ()=> {
    console.log("Server is running at 3000");
    
})