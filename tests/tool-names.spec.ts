import { describe, expect, it } from 'vitest'
import { publicToolName } from '../src/tools.js'

import { readFileSync } from 'node:fs'
const TOOLS = JSON.parse(readFileSync(new URL('../service.json', import.meta.url), 'utf8')).tools.map((tool: {name: string}) => tool.name) as string[]

describe('Harness tool namespace', () => {
  it('preserves all advertised FitMeet tool names under the fitmeet namespace', () => {
    expect(TOOLS.map(tool => publicToolName('fitmeet', tool))).toEqual(
      TOOLS.map(tool => `mcp__fitmeet__${tool}`),
    )
  })
})
