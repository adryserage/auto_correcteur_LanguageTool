import { describe, it, expect } from 'vitest'
import {
  buildRephraseMessages,
  cleanRephraseOutput,
  detectLanguage,
} from '../../src/content/rephrase-client'
import { normalizeRephraseUrl } from '../../src/shared/api-url'

describe('buildRephraseMessages', () => {
  it('sends the text as the user message', () => {
    const messages = buildRephraseMessages('Bonjour a tous', 'auto')
    expect(messages).toHaveLength(2)
    expect(messages[1]).toEqual({ role: 'user', content: 'Bonjour a tous' })
  })

  it('writes the instructions in the language of the text in auto mode', () => {
    expect(
      buildRephraseMessages('je pense que la réunion est annulée', 'auto')[0].content
    ).toContain('Réponds en français')
    expect(buildRephraseMessages('i think the meeting is canceled', 'auto')[0].content).toContain(
      'Reply in English'
    )
  })

  it('uses the selected language', () => {
    expect(buildRephraseMessages('hello there', 'fr')[0].content).toContain('Réponds en français')
    expect(buildRephraseMessages('bonjour', 'en')[0].content).toContain('Reply in English')
  })
})

describe('detectLanguage', () => {
  it('detects French', () => {
    expect(detectLanguage('salut, la reunion de demain est annule, on la remet a jeudi')).toBe('fr')
  })

  it('detects English', () => {
    expect(detectLanguage('hey, the meeting is canceled and we move it to thursday')).toBe('en')
  })

  it('falls back to French on a tie', () => {
    expect(detectLanguage('ok')).toBe('fr')
  })
})

describe('cleanRephraseOutput', () => {
  it('trims whitespace', () => {
    expect(cleanRephraseOutput('  Bonjour.\n', 'bonjour')).toBe('Bonjour.')
  })

  it('removes think blocks', () => {
    expect(cleanRephraseOutput('<think>hmm</think>\nBonjour.', 'bonjour')).toBe('Bonjour.')
  })

  it('removes a leading label', () => {
    expect(cleanRephraseOutput('Texte reformulé : Bonjour.', 'bonjour')).toBe('Bonjour.')
    expect(cleanRephraseOutput('Rephrased text: Hello.', 'hello')).toBe('Hello.')
  })

  it('removes quotes the model added', () => {
    expect(cleanRephraseOutput('"Bonjour."', 'bonjour')).toBe('Bonjour.')
    expect(cleanRephraseOutput('« Bonjour. »', 'bonjour')).toBe('Bonjour.')
  })

  it('keeps quotes that were in the original', () => {
    expect(cleanRephraseOutput('"Bonjour."', '"bonjour"')).toBe('"Bonjour."')
  })

  it('collapses blank lines the model added', () => {
    expect(cleanRephraseOutput('Bonjour,\n\nMerci.', 'bonjour,\nmerci')).toBe('Bonjour,\nMerci.')
    expect(cleanRephraseOutput('A.\n\nB.', 'a\n\nb')).toBe('A.\n\nB.')
  })

  it('keeps line breaks inside the text', () => {
    expect(cleanRephraseOutput('Ligne 1.\nLigne 2.', 'ligne 1\nligne 2')).toBe('Ligne 1.\nLigne 2.')
  })
})

describe('normalizeRephraseUrl', () => {
  it('strips a trailing /v1 since the client appends it', () => {
    expect(normalizeRephraseUrl('https://example.com/v1/')).toBe('https://example.com')
  })

  it('keeps /v2, which only LanguageTool uses', () => {
    expect(normalizeRephraseUrl('https://example.com/v2')).toBe('https://example.com/v2')
  })

  it('rejects invalid input', () => {
    expect(normalizeRephraseUrl('not a url')).toBeNull()
  })
})
