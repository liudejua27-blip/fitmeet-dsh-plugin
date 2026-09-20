import {cp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=process.cwd(), base=JSON.parse(await readFile('package.json','utf8'));
for(const locale of ['en','zh-CN']){
  const name=locale==='en'?'fitmeet-dsh-plugin':'fitmeet-dsh-plugin-zh';
  const dir=resolve(root,'dist',locale);await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});
  // Explicit public allowlist: credentials, tests, source checkout and local state never enter artifacts.
  for(const file of ['lib','skills/fitmeet','assets/fitmeet-icon.png','cordis.patch.yml','mcp.json','README.md','README.en.md','README.zh-CN.md','LICENSE','THIRD_PARTY_NOTICES.md','SECURITY.md','service.json','CHANGELOG.md']) await cp(file,resolve(dir,file),{recursive:true});
  const pkg={...base,name,fitmeet:{locale},scripts:{},description:locale==='en'?base.description:'FitMeet：让想法找到一起行动的人。为 Agent 连接真实人物、同好与活动的中文 MCP + Skill 插件，支持授权发布与私聊。'};
  await writeFile(resolve(dir,'package.json'),JSON.stringify(pkg,null,2)+'\n');
  await writeFile(resolve(dir,'lib/distribution.js'),`export const DISTRIBUTION_LOCALE = ${JSON.stringify(locale)};\nexport const DISTRIBUTION_NAME = ${JSON.stringify(name)};\n`);
  // No stale source map for a generated distribution module.
  await rm(resolve(dir,'lib/distribution.js.map'),{force:true});
  const patch=(await readFile('cordis.patch.yml','utf8')).replace('name: fitmeet-dsh-plugin',`name: ${name}`);
  await writeFile(resolve(dir,'cordis.patch.yml'),patch);
  if(locale==='zh-CN') await cp('README.zh-CN.md',resolve(dir,'README.md'));
  const m=JSON.parse(await readFile(resolve(dir,'service.json'),'utf8'));
  for(const skill of ['SKILL.md','SKILL.en.md']){
    const text=await readFile(resolve(dir,'skills/fitmeet',skill),'utf8');
    assert.deepEqual(text.match(/^allowed-tools: (.+)$/m)[1].split(',').map(s=>s.trim()).sort(),m.tools.map(t=>t.name).sort());
    for(const tool of m.tools)assert.ok(text.includes('`'+tool.name+'`'));
  }
  const results=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json'],{cwd:dir,encoding:'utf8'}));
  assert.equal(results.length,1);
  assert.ok(results[0].files.every(f=>!/(^|\/)(\.env|\.npmrc|node_modules|\.git|oauth-state)/.test(f.path)));
  assert.ok(results[0].files.some(f=>f.path==='skills/fitmeet/SKILL.en.md'));
  console.log(JSON.stringify({locale,name,version:base.version,path:resolve(dir,results[0].filename),files:results[0].files.length,integrity:results[0].integrity}));
}
