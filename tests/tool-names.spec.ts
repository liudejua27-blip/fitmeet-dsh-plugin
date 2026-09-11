import { describe, expect, it } from 'vitest'
import { publicToolName } from '../src/tools.js'

const TOOLS = [
  'fitmeet_profile_get',
  'fitmeet_people_search',
  'fitmeet_people_details',
  'fitmeet_publication_sources',
  'fitmeet_publication_prepare',
  'fitmeet_publication_confirm',
  'fitmeet_conversations_list',
  'fitmeet_messages_list',
  'fitmeet_chat_prepare',
  'fitmeet_chat_confirm',
  'fitmeet_message_prepare',
  'fitmeet_message_confirm',
]

describe('Harness tool namespace', () => {
  it('preserves all 12 FitMeet tool names under the fitmeet namespace', () => {
    expect(TOOLS.map(tool => publicToolName('fitmeet', tool))).toEqual(
      TOOLS.map(tool => `mcp__fitmeet__${tool}`),
    )
  })
})
