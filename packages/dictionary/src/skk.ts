import { parseNotation, SELECTOR_FIRST_READING, SELECTOR_SUPPRESS } from '@furifont/core'

/** Formats words and kanji with multiple readings in a font plan as an SKK JISYO. */
export function formatSkkDictionary(words: Record<string, string[]>, kanji: Record<string, string[]>): string {
  const entries = new Map<string, Set<string>>()

  const addReadings = (form: string, readings: string[], readingOf: (reading: string, index: number) => string): void => {
    if (readings.length < 2)
      return

    const [first = '', ...rest] = [...form]
    const withoutRuby = first + String.fromCodePoint(SELECTOR_SUPPRESS) + rest.join('')
    const candidate = (index: number): string => first
      + String.fromCodePoint(SELECTOR_FIRST_READING + index)
      + rest.join('')
    const add = (reading: string, value: string): void => {
      const candidates = entries.get(reading) ?? new Set<string>()
      candidates.add(value)
      entries.set(reading, candidates)
    }

    readings.forEach((reading, index) => {
      const key = readingOf(reading, index)
      add(key, withoutRuby)
      add(key, candidate(index))
    })
  }

  for (const [form, readings] of Object.entries(words)) {
    const parsed = readings.map(notation => parseNotation(notation))
    addReadings(form, readings, (_, index) => parsed[index]!.spans.map(span => span.ruby).join(''))
  }

  for (const [form, readings] of Object.entries(kanji))
    addReadings(form, readings, reading => reading)

  const lines = [...entries]
    .sort(([a], [b]) => a.localeCompare(b, 'ja'))
    .map(([reading, candidates]) => `${reading} /${[...candidates].sort().join('/')}/`)

  return [';; okuri-ari entries.', ';; okuri-nasi entries.', ...lines, ''].join('\n')
}
