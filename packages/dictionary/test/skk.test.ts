import { describe, expect, it } from 'vitest'
import { formatSkkDictionary } from '../src/skk'

describe('formatSkkDictionary', () => {
  it('writes words with multiple readings and selects each IVS', () => {
    const output = formatSkkDictionary({
      今日: ['今日[きょう]', '今日[こんにち]'],
      市場: ['市[いち]場[ば]', '市[し]場[じょう]'],
    }, {})

    expect(output).toBe([
      ';; okuri-ari entries.',
      ';; okuri-nasi entries.',
      'いちば /市\u{E01E0}場/市\u{E01E1}場/',
      'きょう /今\u{E01E0}日/今\u{E01E1}日/',
      'こんにち /今\u{E01E0}日/今\u{E01E2}日/',
      'しじょう /市\u{E01E0}場/市\u{E01E2}場/',
      '',
    ].join('\n'))
  })

  it('omits words with only one reading', () => {
    expect(formatSkkDictionary({
      日本: ['日[に]本[ほん]'],
    }, {})).toBe(';; okuri-ari entries.\n;; okuri-nasi entries.\n')
  })

  it('writes kanji with multiple readings', () => {
    expect(formatSkkDictionary({}, {
      来: ['く', 'き', 'こ'],
      日: ['ひ'],
    })).toBe([
      ';; okuri-ari entries.',
      ';; okuri-nasi entries.',
      'き /来\u{E01E0}/来\u{E01E2}/',
      'く /来\u{E01E0}/来\u{E01E1}/',
      'こ /来\u{E01E0}/来\u{E01E3}/',
      '',
    ].join('\n'))
  })

  it('groups candidates that share a reading', () => {
    expect(formatSkkDictionary({
      今日: ['今日[きょう]', '今日[こんにち]'],
      明日: ['明日[あした]', '明日[こんにち]'],
    }, {})).toContain('こんにち /今\u{E01E0}日/今\u{E01E2}日/明\u{E01E0}日/明\u{E01E2}日/')
  })

  it('does not list a selector candidate under a different reading', () => {
    expect(formatSkkDictionary({}, {
      上: ['じょう', 'あ'],
    })).toBe([
      ';; okuri-ari entries.',
      ';; okuri-nasi entries.',
      'あ /上\u{E01E0}/上\u{E01E2}/',
      'じょう /上\u{E01E0}/上\u{E01E1}/',
      '',
    ].join('\n'))
  })
})
