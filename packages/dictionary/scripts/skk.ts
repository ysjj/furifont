import { mkdir, writeFile } from 'node:fs/promises'
import { createFontPlanner, resolveOptions } from '@furifont/core'
import { loadDictionary } from '../src/index.ts'
import { formatSkkDictionary } from '../src/skk.ts'

const DATA = new URL('../data/', import.meta.url)
const dictionary = await loadDictionary()

const texts = [dictionary.runs, dictionary.kanji]
  .flatMap(table => Object.entries(table).flatMap(([text, readings]) => [text, ...Object.keys(readings)]))
const kana = Array.from({ length: 0x30FF - 0x3041 + 1 }, (_, i) => 0x3041 + i)
const coverage = new Set([...texts.flatMap(text => [...text].map(char => char.codePointAt(0)!)), ...kana])
const { ivs } = createFontPlanner(dictionary)(resolveOptions(), coverage).report
const output = formatSkkDictionary(ivs.words, ivs.kanji)

await mkdir(DATA, { recursive: true })
await writeFile(new URL('SKK-JISYO.furifont', DATA), output)
console.log(`Wrote SKK JISYO with ${output.split('\n').filter(line => line && !line.startsWith(';;')).length} readings`)
