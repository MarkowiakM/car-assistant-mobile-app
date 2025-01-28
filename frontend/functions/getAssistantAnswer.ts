import { Platform } from "react-native";
import * as Device from "expo-device";
import { ModelRequest, ModelResponse } from "@/types/AnswerQuestion";
import { API_URL } from "@/constants/api";
import Toast from "react-native-toast-message";

export const getAssistantAnswer = async (prompt: ModelRequest): Promise<ModelResponse> => {
    const serverUrl =
        Platform.OS === "android" || Platform.OS === "ios" || Device.isDevice
            ? API_URL
            : "http://localhost:4000";
    console.log("Getting assistant answer...", serverUrl);

    const serverResponse = await fetch(`${serverUrl}/model-response`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(prompt),
    })
        .then((res) => res.json() as Promise<ModelResponse>)
        .catch((e: Error) => {
            console.error(e);
            Toast.show({
                type: 'error',
                text1: 'Wystąpił błąd podczas pobierania odpowiedzi',
            });
            throw new Error("Error getting assistant answer");
        });

    if (!serverResponse) {
        throw new Error("Error getting assistant answer");
    }
    return serverResponse;
}