import {expect,it,vi} from 'vitest'
import {syncTools} from '../src/tools.js'
import type {Client} from '@modelcontextprotocol/sdk/client/index.js'
import type {Context} from '@deepseek-ai/cordis'
it('stops repeated discovery cursors without discarding the current tool generation',async()=>{
  const request=vi.fn().mockResolvedValue({tools:[],nextCursor:'same'})
  const dispose=vi.fn(),register=vi.fn()
  await expect(syncTools({request} as unknown as Client,{tools:{register}} as unknown as Context,
    {registrationFailure:'throw',serverName:'fitmeet',toolCallTimeoutMs:1000},new Map([['existing',dispose]]))).rejects.toThrow('did not terminate')
  expect(request).toHaveBeenCalledTimes(2)
  expect(dispose).not.toHaveBeenCalled();expect(register).not.toHaveBeenCalled()
})
