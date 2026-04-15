/**
 * Extracts and parses a JSON object from a string that may contain
 * markdown code fences, prose, or other non-JSON content.
 */
export function extractJson(text: string): unknown {
  let cleaned = text.trim()

  // If the response was cut off before the closing fence, strip the partial fence
  const codeMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeMatch) {
    cleaned = codeMatch[1].trim()
  } else {
    // No closing fence — response was likely truncated mid-generation
    const fenceStart = cleaned.indexOf('```')
    if (fenceStart !== -1) {
      cleaned = cleaned.slice(fenceStart).replace(/^```(?:json)?\s*/, '').trim()
    }
  }

  const start = cleaned.indexOf('{')
  if (start === -1) throw new Error('No JSON found in response')

  // Detect truncation: if there's no matching closing brace the response was cut off
  const end = cleaned.lastIndexOf('}')
  if (end === -1) throw new Error('Response was truncated — no complete JSON object received. Try again.')

  return JSON.parse(cleaned.slice(start, end + 1))
}
