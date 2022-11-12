import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Express backend töötab");
});

app.listen(5000, () => console.log("Server running"));
