import { describe, it, expect } from 'vitest'
import { normalizeApiUrl, originPattern } from '../../src/shared/api-url'

describe('normalizeApiUrl', () => {
  it('keeps a plain https URL', () => {
    expect(normalizeApiUrl('https://example.com')).toBe('https://example.com')
  })

  it('strips trailing slashes', () => {
    expect(normalizeApiUrl('https://example.com///')).toBe('https://example.com')
  })

  it('strips a trailing /v2 since the client appends it', () => {
    expect(normalizeApiUrl('https://example.com/v2')).toBe('https://example.com')
    expect(normalizeApiUrl('https://example.com/v2/')).toBe('https://example.com')
  })

  it('keeps a path prefix', () => {
    expect(normalizeApiUrl('https://example.com/lt/v2')).toBe('https://example.com/lt')
  })

  it('trims whitespace', () => {
    expect(normalizeApiUrl('  http://localhost:8081  ')).toBe('http://localhost:8081')
  })

  it('rejects invalid input', () => {
    expect(normalizeApiUrl('')).toBeNull()
    expect(normalizeApiUrl('not a url')).toBeNull()
    expect(normalizeApiUrl('ftp://example.com')).toBeNull()
    expect(normalizeApiUrl('javascript:alert(1)')).toBeNull()
  })
})

describe('originPattern', () => {
  it('builds a host permission pattern from the origin', () => {
    expect(originPattern('https://example.com/lt')).toBe('https://example.com/*')
    expect(originPattern('http://localhost:8081')).toBe('http://localhost:8081/*')
  })
})
