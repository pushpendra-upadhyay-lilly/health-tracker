export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const WORKER_URL = import.meta.env.VITE_AI_WORKER_URL as string;
const APP_SECRET = import.meta.env.VITE_APP_SECRET as string;

// ── Streaming ────────────────────────────────────────────────────────────────
// Appends ?stream → Worker uses streamGenerateContent?alt=sse.
// Use for Progress Feedback (live token-by-token updates).
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const response = await fetch(`${WORKER_URL}?stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-App-Secret": APP_SECRET },
    body: JSON.stringify({ contents }),
    signal,
  });

  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data) continue;
      try {
        const parsed = JSON.parse(data);
        const text: string | undefined =
          parsed.candidates?.[0]?.content?.parts
            ?.filter((p: { thought?: boolean }) => !p.thought)
            ?.map((p: { text?: string }) => p.text ?? "")
            .join("");
        if (text) onChunk(text);
      } catch {
        // incomplete chunk, skip
      }
    }
  }
}

// ── Non-streaming ─────────────────────────────────────────────────────────────
// No query param → Worker uses generateContent (plain JSON).
// Use for Plan Creator (needs complete JSON before parsing).

interface GeminiPart {
  text?: string;
  thought?: boolean;
}
interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
}

export async function chat(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-App-Secret": APP_SECRET },
    body: JSON.stringify({ contents }),
    signal,
  });

  const rawText = await response.text();

  if (!response.ok) {
    console.error("[chat] error", response.status, rawText.slice(0, 300));
    throw new Error(`Worker returned ${response.status}: ${rawText.slice(0, 150)}`);
  }

  let data: GeminiResponse;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error("[chat] JSON parse failed:", rawText.slice(0, 300));
    throw new Error("Response was not valid JSON — check Worker endpoint config.");
  }

  const text =
    data.candidates?.[0]?.content?.parts
      ?.filter((p) => !p.thought && p.text)
      ?.map((p) => p.text ?? "")
      .join("") ?? "";

  if (!text) {
    console.error("[chat] empty text, full response:", rawText.slice(0, 500));
    throw new Error("Gemini returned no text.");
  }

  return text;
}
