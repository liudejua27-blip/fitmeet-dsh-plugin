import '@deepseek-ai/cordis'

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

export interface JsonSchemaNode {
  type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null'
  oneOf?: JsonSchemaNode[]
  properties?: Record<string, JsonSchemaNode>
  required?: string[]
  additionalProperties?: boolean
  items?: JsonSchemaNode
  enum?: Array<string | number | boolean | null>
  const?: string | number | boolean | null
  description?: string
  title?: string
  default?: JsonValue
  examples?: JsonValue
}

export interface ToolExecution {
  readonly signal: AbortSignal
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: {
    schema: JsonSchemaNode
    render(args: unknown, value: JsonValue): Array<{ type: 'text'; text: string }>
  }
  execute(args: unknown, exec: ToolExecution): Promise<unknown>
}

export type CredentialRef = string & { readonly __credentialRef: unique symbol }

export interface CredentialProvider {
  resolve(ref: CredentialRef): Promise<{ value: string; source: string } | undefined>
  set(ref: CredentialRef, value: string): Promise<void>
}

export interface ToolRuntime {
  register(definition: ToolDefinition): () => void
}

export interface SystemPromptRegistry {
  section(section: { name: string; order: number; text: string }): () => void
}

export interface SkillRegistration {
  name: string
  description: string
  whenToUse?: string
  source: string
  resourceBase?: { readonly kind: 'directory'; readonly path: string }
  content: string
  invocation?: {
    readonly modelInvocable: boolean
    readonly userInvocable: boolean
  }
}

export interface SkillRegistry {
  register(skill: SkillRegistration): () => void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    credentials: CredentialProvider
    skills: SkillRegistry
    systemPrompt: SystemPromptRegistry
    tools: ToolRuntime
  }
}

const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

export function credentialRef(value: string): CredentialRef {
  if (!CREDENTIAL_REF_PATTERN.test(value)) {
    throw new TypeError(`credential ref "${value}" must match ${String(CREDENTIAL_REF_PATTERN)}`)
  }
  return value as CredentialRef
}

const SCHEMA_KEYS = new Set([
  'type',
  'oneOf',
  'properties',
  'required',
  'additionalProperties',
  'items',
  'enum',
  'const',
  'description',
  'title',
  'default',
  'examples',
])

export function assertSupportedJsonSchema(value: unknown): asserts value is JsonSchemaNode {
  if (!isSchema(value, new Set())) throw new TypeError('unsupported JSON schema')
}

function isSchema(value: unknown, seen: Set<object>): value is JsonSchemaNode {
  if (!isRecord(value) || seen.has(value) || Object.keys(value).some(key => !SCHEMA_KEYS.has(key))) return false
  seen.add(value)
  try {
    if (value.description !== undefined && typeof value.description !== 'string') return false
    if (value.title !== undefined && typeof value.title !== 'string') return false
    if (value.default !== undefined && !isJsonValue(value.default)) return false
    if (value.examples !== undefined && !isJsonValue(value.examples)) return false
    if (value.type === undefined) {
      if (value.oneOf === undefined) return !hasConstraintWithoutType(value)
      return !hasOneOfSiblingConstraint(value)
        && Array.isArray(value.oneOf) && value.oneOf.length >= 2
        && value.oneOf.every(item => isSchema(item, seen))
    }
    if (value.oneOf !== undefined || !isSchemaType(value.type)) return false
    if (value.type === 'object') {
      if (value.items !== undefined || value.enum !== undefined || value.const !== undefined) return false
      if (value.properties !== undefined
        && (!isRecord(value.properties) || !Object.values(value.properties).every(item => isSchema(item, seen)))) return false
      if (value.required !== undefined
        && (!Array.isArray(value.required) || !value.required.every(key => typeof key === 'string'
          && isRecord(value.properties) && Object.hasOwn(value.properties, key)))) return false
      return value.additionalProperties === undefined || typeof value.additionalProperties === 'boolean'
    }
    if (value.type === 'array') {
      if (value.properties !== undefined || value.required !== undefined
        || value.additionalProperties !== undefined || value.enum !== undefined || value.const !== undefined) return false
      return value.items === undefined || isSchema(value.items, seen)
    }
    if (value.properties !== undefined || value.required !== undefined
      || value.additionalProperties !== undefined || value.items !== undefined) return false
    return validScalarConstraint(value.type, value.enum, true)
      && validScalarConstraint(value.type, value.const, false)
  } finally {
    seen.delete(value)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasConstraintWithoutType(value: Record<string, unknown>): boolean {
  return ['properties', 'required', 'additionalProperties', 'items', 'enum', 'const']
    .some(key => Object.hasOwn(value, key))
}

function hasOneOfSiblingConstraint(value: Record<string, unknown>): boolean {
  return hasConstraintWithoutType(value)
}

function isSchemaType(value: unknown): value is NonNullable<JsonSchemaNode['type']> {
  return ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'].includes(String(value))
}

function validScalarConstraint(type: NonNullable<JsonSchemaNode['type']>, value: unknown, array: boolean): boolean {
  if (value === undefined) return true
  const entries = array ? value : [value]
  if (!Array.isArray(entries) || entries.length === 0) return false
  return entries.every(item => type === 'null' ? item === null
    : type === 'integer' ? typeof item === 'number' && Number.isInteger(item) && !Object.is(item, -0)
    : type === 'number' ? typeof item === 'number' && Number.isFinite(item) && !Object.is(item, -0)
    : typeof item === type)
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value) && !Object.is(value, -0)
  if (Array.isArray(value)) return value.every(isJsonValue)
  return isRecord(value) && Object.values(value).every(isJsonValue)
}
