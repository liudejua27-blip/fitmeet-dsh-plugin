import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const website = existsSync(resolve(root, 'public/integrations/fitmeet/service.json'));
const read = path => readFileSync(resolve(root, path), 'utf8');
const manifest = JSON.parse(read(website ? 'public/integrations/fitmeet/service.json' : 'service.json'));
const skillPath = website ? 'public/skills/fitmeet/SKILL.md' : 'skills/fitmeet/SKILL.md';
const skill = read(skillPath);
const sorted = values => [...values].sort();
assert.equal(manifest.toolCount, manifest.tools.length, 'Tool count drift');
assert.equal(new Set(manifest.tools.map(t => t.name)).size, manifest.toolCount, 'Duplicate tools');
assert.deepEqual(sorted(manifest.authentication.optionalScopes), sorted(new Set(manifest.tools.flatMap(t => t.scopes))), 'Scope drift');
assert.deepEqual(sorted(skill.match(/^allowed-tools: (.+)$/m)[1].split(',').map(s => s.trim())), sorted(manifest.tools.map(t => t.name)), 'Skill tool drift');
for (const tool of manifest.tools) assert.ok(skill.includes('`' + tool.name + '`'), `Missing Skill documentation: ${tool.name}`);
assert.equal(JSON.parse(read(website ? 'public/mcp.json' : 'mcp.json')).mcpServers.fitmeet.url, manifest.endpoint);
if (website) {
  const page = read('app/mcp/page.tsx');
  assert.deepEqual(sorted(new Set(page.match(/fitmeet_[a-z_]+/g))), sorted(manifest.tools.map(t => t.name)), 'MCP page tool drift');
  assert.ok(page.includes('service.toolCount'), 'Render tool count from manifest');
  for (const section of read('lib/fitmeet-discovery-content.ts').split('"path":')) {
    if (section.startsWith(' "/integrations"')) assert.ok(!/十二|12 个|twelve/.test(section), 'Current integration page is stale');
  }
}
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--runtime') {
    const source = readFileSync(resolve(args[++i], 'src/mcp-server.ts'), 'utf8');
    const body = source.split('export const FITMEET_MCP_TOOLS = {')[1]?.split('} as const')[0];
    assert.ok(body, 'Runtime catalog parser requires review');
    const tools = [...body.matchAll(/(fitmeet_\w+): (\[[^\]]+\])/g)].map(([, name, scopes]) => ({ name, scopes: JSON.parse(scopes) }));
    assert.deepEqual(manifest.tools, tools, 'Runtime tool or scope drift');
    assert.equal(manifest.serverVersion, source.match(/new McpServer\(\{ name: "fitmeet", version: "([^"]+)"/)[1], 'Runtime version drift');
  } else if (args[i] === '--package') {
    const other = resolve(args[++i]);
    assert.deepEqual(JSON.parse(readFileSync(resolve(other, 'service.json'), 'utf8')), manifest, 'Distribution manifest drift');
    assert.equal(readFileSync(resolve(other, 'skills/fitmeet/SKILL.md'), 'utf8'), skill, 'Distribution Skill drift');
    assert.equal(readFileSync(resolve(other, 'skills/fitmeet/references/setup.md'), 'utf8'), read(website ? 'public/skills/fitmeet/references/setup.md' : 'skills/fitmeet/references/setup.md'));
  } else if (args[i] === '--live') {
    const response = await fetch('https://fitmeet.cn/integrations/fitmeet/service.json', { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), manifest, 'Live service documentation drift');
  } else throw new Error('Use --runtime PATH, --package PATH or --live');
}
console.log(JSON.stringify({ status: 'PASS', serverVersion: manifest.serverVersion, toolCount: manifest.toolCount, scopeCount: manifest.authentication.optionalScopes.length, liveChecked: args.includes('--live') }));
