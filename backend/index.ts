
import express, { Request, Response } from "express";
import { speechToText } from "./speechToText";
import cors from "cors";
import "dotenv/config";
import { modelResponse } from "./modelResponse";
import { textToSpeech } from "./textToSpeech";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();
app.use(express.json({ limit: "50mb" }));

// Cross-origin requests
app.use(cors());

app.post("/speech-to-text", (req: Request, res: Response) => {
  speechToText(req, res);
});

app.post("/text-to-speech", (req: Request, res: Response) => {
  textToSpeech(req, res);
});

app.post("/model-response", (req: Request, res: Response) => {
  modelResponse(req, res);
})

app.get("/", (req, res) => {
  res.send("The Speech-to-Text API is up and running!");
});

app.listen(4000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:4000');
});