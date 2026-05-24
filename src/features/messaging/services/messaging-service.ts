import type { Message, SendMessageRequest } from "../types";

export async function sendMessage(
  request: SendMessageRequest
): Promise<Message> {
  throw new Error("Not implemented");
}

export async function getMessages(projectId: string): Promise<Message[]> {
  throw new Error("Not implemented");
}
