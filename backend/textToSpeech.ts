import { Request, Response } from "express";

export const textToSpeech = async (req: Request, res: Response) => {
    const data = req.body;
    const text = data?.text;

    if (!text) return res.status(400).send("No text was provided.");

    try {
        const speechResults = await fetch(
            "https://texttospeech.googleapis.com/v1/text:synthesize",
            {
                method: "POST",
                body: JSON.stringify({
                    "audioConfig": {
                        "audioEncoding": "MP3",
                        "effectsProfileId": [
                            "small-bluetooth-speaker-class-device"
                        ],
                        "pitch": 0,
                        "speakingRate": 1
                    },
                    input: {
                        text: text,
                    },
                    voice: {
                        languageCode: "pl-PL",
                        name: "pl-PL-Wavenet-B",
                    },
                }),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-goog-api-key": `${process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY}`,
                },
            }
        ).then((response) => response.json());
        return res.send(speechResults);
    } catch (err) {
        console.error("Error converting text to speech: ", err);
        res.status(404).send(err);
        return err;
    }
};

