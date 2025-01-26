import { Platform } from "react-native";
import * as Device from "expo-device";
import { ModelRequest, ModelResponse } from "@/types/AnswerQuestion";

export const readText = async (text: string): Promise<any> => {
    const serverUrl =
              Platform.OS === "android" || Platform.OS === "ios" || Device.isDevice
                ? "https://995a-77-222-252-51.ngrok-free.app"
                : "http://locaalhost:4000"; 
    console.log("Text to speech...", serverUrl);

    const serverResponse = await fetch(`${serverUrl}/text-to-speech`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    })
        .then((res) => res.json() as Promise<any>)
        .catch((e: Error) => {
            console.error(e);
            return null;
        });

    if (!serverResponse) {
        throw new Error("Error getting assistant answer");
    }
    return serverResponse;
}