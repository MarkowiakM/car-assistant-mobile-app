import { Platform } from "react-native";
import * as Device from "expo-device";
import { ModelRequest, ModelResponse } from "@/types/AnswerQuestion";

export const getAssistantAnswer = async (prompt: ModelRequest): Promise<ModelResponse> => {
    const rootOrigin =
        Platform.OS === "android"
            ? "10.0.2.2"
            : Device.isDevice
                ? process.env.LOCAL_DEV_IP || "localhost"
                : "localhost";
    const serverUrl = `http://${rootOrigin}:4000`;

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
            return null;
        });

    if (!serverResponse) {
        throw new Error("Error getting assistant answer");
    }
    return serverResponse;
}