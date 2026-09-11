import '@deepseek-ai/cordis';
export type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
export interface JsonSchemaNode {
    type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
    oneOf?: JsonSchemaNode[];
    properties?: Record<string, JsonSchemaNode>;
    required?: string[];
    additionalProperties?: boolean;
    items?: JsonSchemaNode;
    enum?: Array<string | number | boolean | null>;
    const?: string | number | boolean | null;
    description?: string;
    title?: string;
    default?: JsonValue;
    examples?: JsonValue;
}
export interface ToolExecution {
    readonly signal: AbortSignal;
}
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    output: {
        schema: JsonSchemaNode;
        render(args: unknown, value: JsonValue): Array<{
            type: 'text';
            text: string;
        }>;
    };
    execute(args: unknown, exec: ToolExecution): Promise<unknown>;
}
export type CredentialRef = string & {
    readonly __credentialRef: unique symbol;
};
export interface CredentialProvider {
    resolve(ref: CredentialRef): Promise<{
        value: string;
        source: string;
    } | undefined>;
    set(ref: CredentialRef, value: string): Promise<void>;
}
export interface ToolRuntime {
    register(definition: ToolDefinition): () => void;
}
export interface SystemPromptRegistry {
    section(section: {
        name: string;
        order: number;
        text: string;
    }): () => void;
}
export interface SkillRegistration {
    name: string;
    description: string;
    whenToUse?: string;
    source: string;
    resourceBase?: {
        readonly kind: 'directory';
        readonly path: string;
    };
    content: string;
    invocation?: {
        readonly modelInvocable: boolean;
        readonly userInvocable: boolean;
    };
}
export interface SkillRegistry {
    register(skill: SkillRegistration): () => void;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        credentials: CredentialProvider;
        skills: SkillRegistry;
        systemPrompt: SystemPromptRegistry;
        tools: ToolRuntime;
    }
}
export declare function credentialRef(value: string): CredentialRef;
export declare function assertSupportedJsonSchema(value: unknown): asserts value is JsonSchemaNode;
//# sourceMappingURL=dsh.d.ts.map