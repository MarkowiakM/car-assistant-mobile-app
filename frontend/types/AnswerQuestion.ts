export type Role = "user" | "model";

export interface AnswerQuestion {
    role: Role,
    parts: {
        text: string,
    }[]
}

export interface ModelRequest {
    history: AnswerQuestion[],
    userPrompt: string,
}

export interface ModelResponse {
    text: string
}