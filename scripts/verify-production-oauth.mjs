const endpoint = 'https://api.fitmeet.cn/api/v1/mcp'
const issuer = 'https://api.fitmeet.cn'
const resourceMetadataUrl = `${issuer}/.well-known/oauth-protected-resource/api/v1/mcp`
const authorizationMetadataUrl = `${issuer}/.well-known/oauth-authorization-server`
const expectedScopes = [
  'profile:read',
  'people:search',
  'hall:publish',
  'messages:read',
  'messages:write',
]

const unauthorized = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'fitmeet-dsh-plugin-check', version: '0.1.0' },
    },
  }),
})

assert(unauthorized.status === 401, `expected unauthenticated MCP request to return 401, received ${unauthorized.status}`)
const challenge = unauthorized.headers.get('www-authenticate') ?? ''
assert(challenge.includes(`resource_metadata="${resourceMetadataUrl}"`), 'MCP challenge does not advertise the expected resource metadata URL')

const [resourceResponse, authorizationResponse] = await Promise.all([
  fetch(resourceMetadataUrl),
  fetch(authorizationMetadataUrl),
])
assert(resourceResponse.ok, `resource metadata returned ${resourceResponse.status}`)
assert(authorizationResponse.ok, `authorization metadata returned ${authorizationResponse.status}`)

const resource = await resourceResponse.json()
const authorization = await authorizationResponse.json()

assert(resource.resource === endpoint, 'protected resource does not match the FitMeet MCP endpoint')
assert(Array.isArray(resource.authorization_servers) && resource.authorization_servers.includes(issuer), 'protected resource does not name the FitMeet issuer')
assert(sameSet(resource.scopes_supported, expectedScopes), 'protected resource scopes do not match the plugin scopes')
assert(authorization.issuer === issuer, 'authorization server issuer does not match FitMeet')
assert(authorization.registration_endpoint === `${issuer}/api/v1/mcp/oauth/register`, 'dynamic client registration endpoint is missing or incorrect')
assert(authorization.authorization_endpoint === `${issuer}/api/v1/mcp/oauth/authorize`, 'authorization endpoint is missing or incorrect')
assert(authorization.token_endpoint === `${issuer}/api/v1/mcp/oauth/token`, 'token endpoint is missing or incorrect')
assert(authorization.revocation_endpoint === `${issuer}/api/v1/mcp/oauth/revoke`, 'revocation endpoint is missing or incorrect')
assert(Array.isArray(authorization.code_challenge_methods_supported) && authorization.code_challenge_methods_supported.length === 1 && authorization.code_challenge_methods_supported[0] === 'S256', 'authorization server must support only PKCE S256')

console.log('FitMeet production OAuth metadata verified: MCP challenge, resource, issuer, scopes, DCR, PKCE S256, refresh, and revocation endpoints are present.')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sameSet(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && expected.every(value => actual.includes(value))
}
