// Client for an OpenAI-compatible chat server (llama.cpp server, Ollama, ...)
// used to rephrase the whole text of a field.

const REQUEST_TIMEOUT = 90000 // Small CPU models need a while for long texts
export const REPHRASE_MIN_LENGTH = 10
export const REPHRASE_MAX_LENGTH = 3000

// Small models translate instead of rephrasing when the instructions are in
// another language, so the prompt is written in the language of the text.
const SYSTEM_PROMPTS = {
  fr:
    "Tu reformules le texte de l'utilisateur pour qu'il soit clair et naturel. " +
    'Garde le sens, le ton, les noms, les nombres, les liens et les retours à la ligne. ' +
    "Corrige l'orthographe et la grammaire. N'ajoute aucune information. " +
    'Réponds en français, avec uniquement le texte reformulé, sans guillemets, titre ni commentaire.',
  en:
    'You rephrase the text the user sends so it reads clearly and naturally. ' +
    'Keep the meaning, the tone, names, numbers, links and line breaks. ' +
    'Fix spelling and grammar. Do not add information. ' +
    'Reply in English, with the rephrased text only, without quotes, title or comment.',
} as const

const FRENCH_WORDS = new Set(
  'le la les un une des du de et est je tu il nous vous ils pas que qui pour dans avec sur ce cette mais ou au aux son sa ses mon ma mes ton ta tes votre vos notre nos merci bonjour'.split(
    ' '
  )
)
const ENGLISH_WORDS = new Set(
  'the a an and is are was were i you he she we they not that which for in on with this but or to of my your our their thanks hello hi'.split(
    ' '
  )
)

/** Guess French or English from common words and accents. Ties go to French. */
export function detectLanguage(text: string): 'fr' | 'en' {
  let fr = (text.match(/[éèêàâçùûôîœ]/gi) || []).length
  let en = 0
  for (const word of text.toLowerCase().split(/[^a-zà-ÿœ']+/)) {
    if (FRENCH_WORDS.has(word)) fr++
    if (ENGLISH_WORDS.has(word)) en++
  }
  return en > fr ? 'en' : 'fr'
}

export function buildRephraseMessages(
  text: string,
  language: 'auto' | 'fr' | 'en'
): { role: 'system' | 'user'; content: string }[] {
  const target = language === 'auto' ? detectLanguage(text) : language
  return [
    { role: 'system', content: SYSTEM_PROMPTS[target] },
    { role: 'user', content: text },
  ]
}

/** Strip what small models add around the answer: think blocks, quotes, labels */
export function cleanRephraseOutput(output: string, original: string): string {
  let text = output.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  text = text.replace(/^(texte reformulé|reformulation|rephrased text|rephrased)\s*:\s*/i, '')

  const quotes: [string, string][] = [
    ['"', '"'],
    ['«', '»'],
    ['“', '”'],
  ]
  for (const [open, close] of quotes) {
    const originalQuoted = original.trim().startsWith(open) && original.trim().endsWith(close)
    if (!originalQuoted && text.length > 1 && text.startsWith(open) && text.endsWith(close)) {
      text = text.slice(open.length, -close.length).trim()
    }
  }

  // Small models turn single line breaks into blank lines
  if (!original.includes('\n\n')) {
    text = text.replace(/\n{2,}/g, '\n')
  }

  return text
}

export async function rephraseText(
  text: string,
  language: 'auto' | 'fr' | 'en',
  rephraseUrl: string,
  apiKey: string
): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  try {
    const response = await fetch(`${rephraseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: buildRephraseMessages(text, language),
        temperature: 0.3,
        // About 1 token per 3 characters, with room for a longer rewrite
        max_tokens: Math.min(2048, Math.ceil(text.length / 2) + 64),
        stream: false,
      }),
      signal: controller.signal,
    })

    if (response.status === 401) {
      throw new Error('Cle API refusee')
    }
    if (!response.ok) {
      throw new Error(`Erreur serveur ${response.status}`)
    }

    const data = await response.json()
    const content: unknown = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      throw new Error('Reponse vide')
    }

    const cleaned = cleanRephraseOutput(content, text)
    if (!cleaned) {
      throw new Error('Reponse vide')
    }
    return cleaned
  } catch (error) {
    throw describeError(error)
  } finally {
    clearTimeout(timeoutId)
  }
}

function describeError(error: unknown): unknown {
  if (error instanceof Error && error.name === 'AbortError') {
    return new Error('Delai depasse')
  }
  if (error instanceof TypeError) {
    return new Error('Serveur injoignable')
  }
  return error
}

export async function checkRephraseConnection(rephraseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${rephraseUrl}/health`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}
