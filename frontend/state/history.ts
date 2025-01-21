import { AnswerQuestion } from "@/types/AnswerQuestion";
import { atom } from "recoil";

export const historyState = atom<AnswerQuestion[]>({
    key: 'history',
    default: [], 
  });