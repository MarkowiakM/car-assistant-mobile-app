import { Request, Response } from "express";

export const modelResponse = async (req: Request, res: Response) => {
    const systemPrompt = "Jesteś asystentem nawigacyjnym w samochodzie, krótki podaj przebieg trasy w prostych " +
        "do zapamiętania krokach, używaj nazw ulic, punktów zainteresowania, nie używaj składni markdown ani znaczników" +
        "końca linii '\n' w odpowiedzi"
    const data = req.body;
    const userPrompt = data.userPrompt;
    const history = data.history;

    if (!userPrompt) return res.status(422).send("No userPrompt was provided.");

    history.push({
        "role": "user",
        "parts": [
            {
                "text": `${userPrompt}`,
            }
        ]
    })
    console.log("history: ", history);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: history,
                    generationConfig: {
                        temperature: 1,
                        topP: 0.95,
                        topK: 64,
                        maxOutputTokens: 8192,
                        stopSequences: [],
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                    ],
                    systemInstruction: {
                        parts: [
                            {
                                text: systemPrompt,
                            },
                        ],
                    },
                }),
            }
        );

        console.log("response status: ", response.status);

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorDetails}`);
        }

        const modelResponse = await response.json();

        console.log("response json: ", modelResponse);

        const generatedContent = modelResponse?.candidates?.[0]?.content?.parts?.[1];

        if (!generatedContent) {
            throw new Error("No content was generated by the model.");
        }

        console.log("Generated response: ", generatedContent);
        return res.send(generatedContent);
    } catch (err) {
        console.error("Error converting speech to text: ", err);
        return res.status(500).send({ error: "Internal Server Error", details: err.message });
    }
};