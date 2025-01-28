import { Request, Response } from "express";

let lastLocation: { lat: number; lon: number; city?: string; street: string; houseNumber: string } | null = {
    lat: 51.108065,
    lon: 17.034784,
    city: "Wrocław",
    street: "Ofiar Oświęcimskich",
    houseNumber: "36"
};


export const modelResponse = async (req: Request, res: Response) => {
    // const systemPrompt = "Jesteś asystentem w samochodzie, zapytany o wskazanie drogi" +
    //     "podaj łatwe do zapamiętania wskazówki, skupiając się na nazwach ulic, punktach zainteresowania." +
    //     "Gdy zostaniesz zapytany o odległość lub czas jaki zajmie podróż odpowiedz w krótki sposób" +
    //     "Gdy zostaniesz zapytany o pomoc w rozwiązaniu problemu to poinstruuj mnie jak sobie z nim poradzić." +
    //     "W swoich odpowiedziach pod żadnym pozorem nie używaj składni markdown ani znaczników końca linii (\n) " +
    //     "gdyż twoja odpowiedź będzie wejściem do syntezatora mowy."
    const systemPrompt = `
    Jesteś asystentem samochodowym. Udzielaj prostych, krótkich, łatwych do zapamiętania wskazówek drogowych, opartych na nazwach ulic i punktach orientacyjnych. Odpowiadaj zwięźle na pytania o czas podróży lub odległość.

Gdy zostaniesz zapytany o pomoc w rozwiązaniu problemu to poinstruuj mnie jak sobie z nim poradzić, ale nie udzielaj porad medycznych ani prawnych. Jeśli problem można rozwiązać samodzielnie, doradź, jak to zrobić. Konstruuj krótkie odpowiedzi.

W swoich odpowiedziach pod żadnym pozorem nie używaj składni markdown ani znaczników końca linii (\n), ponieważ twoje odpowiedzi będą przekazywane do syntezatora mowy.

Tylko gdy będziesz o to bezpośrednio zapytany, podaj numery alarmowe pomocy drogowej w wybranych miastach:
- Wrocław: 535 893 256
- Leszno: 669 932 326
- Poznań: 516 631 516

W sytuacjach kryzysowych dzwoń pod numer **112** lub **999**, tylko jeśli niezbędne`
 // poprawić żeby nie podawał tak często tego nr tel

    const data = req.body;

    let currentLocation = data.location || lastLocation;

    if (
        lastLocation.lat === currentLocation.lat &&
        lastLocation.lon === currentLocation.lon && lastLocation.city &&
        lastLocation.street &&
        lastLocation.houseNumber
    ) {
        currentLocation = lastLocation;
    } else {
        console.log("checking the location");
        const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=
       ${currentLocation.lat}&lon=${currentLocation.lon}&format=json&apiKey=${process.env.LOCATION_API_KEY}`);

        const locationData = await response.json()
        const city = locationData.results[0].city;
        const street = locationData.results[0].street;
        const houseNumber = locationData.results[0].housenumber

        currentLocation = { ...currentLocation, city, street, houseNumber };
        lastLocation = currentLocation;
        console.log(`${city}, ${street}, ${houseNumber}`);
    }

    const history = data.history;
    if (!data.userPrompt) return res.status(422).send("No userPrompt was provided.");

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0"); // Adds leading zero if necessary
    const minutes = now.getMinutes().toString().padStart(2, "0"); // Adds leading zero if necessary
    const currentTime = `${hours}.${minutes}`;

    const userPrompt = `Znajduję się w mieście ${currentLocation.city}, na ulicy ${currentLocation.street} ${currentLocation.houseNumber}. Jest godzina ${currentTime}. ${data.userPrompt}`;

    history.push({
        "role": "user",
        "parts": [
            {
                "text": `${userPrompt}`,
            }
        ]
    })

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
            {
                method: "POST",
                body: JSON.stringify({
                    "contents": history,
                    "generationConfig": {
                        "temperature": 1,
                        "topP": 0.95,
                        "topK": 64,
                        "maxOutputTokens": 8192,
                        "stopSequences": []
                    },
                    "safetySettings": [
                        {
                            "category": "HARM_CATEGORY_HARASSMENT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            "category": "HARM_CATEGORY_HATE_SPEECH",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ],
                    "systemInstruction": {
                        "parts": [
                            {
                                "text": `${systemPrompt}`
                            }
                        ]
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorDetails}`);
        }

        const modelResponse = await response.json();

        const generatedContent = modelResponse?.candidates?.[0]?.content?.parts?.[0].text;

        if (!generatedContent) {
            throw new Error("No content was generated by the model.");
        }

        return res.send({ text: generatedContent });
    } catch (err) {
        console.error("Error converting speech to text: ", err);
        return res.status(500).send({ error: "Internal Server Error", details: err.message });
    }
};