import { Platform } from "react-native";
import * as Device from "expo-device";
import { API_URL } from "@/constants/api";

export const readText = async (text: string): Promise<any> => {
    const serverUrl =
              Platform.OS === "android" || Platform.OS === "ios" || Device.isDevice
                ? API_URL
                : "http://localhost:4000"; 
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