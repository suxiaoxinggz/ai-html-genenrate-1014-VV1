2) Azure OpenAI
	•	Base URL：https://{{resource}}.openai.azure.com
	•	Path Template：{{baseUrl}}/openai/deployments/{{deployment}}/chat/completions?api-version={{apiVersion}}
	•	必填扩展字段：deployment（= 你的部署名），apiVersion（如：2024-06-01）
	•	Auth：Custom Header → api-key: {{apiKey}}
	•	Streaming：OpenAI SSE
	•	Response Mapping：同 OpenAI（Azure 返回结构 99% 兼容）
	•	备注：Default Model 填“部署名”，不是 “gpt-4o” 这样的官方型号。


⸻

3) Anthropic（Claude）
	•	Base URL：https://api.anthropic.com
	•	Path Template：{{baseUrl}}/v1/messages
	•	Auth：Custom Header → x-api-key: {{apiKey}}
	•	Extra Headers：anthropic-version: 2023-06-01
	•	Streaming：Anthropic SSE
	•	Response Mapping
	•	Text：content[*].text（需拼接）
	•	Tool（可选）：content[*].type == "tool_use" → 映射到统一的 tool_calls
	•	Finish：流式事件 message_stop（或非流式无 stop_reason）

⸻

4) Google Vertex AI（Gemini，原生 API）

这是 非 OpenAI 结构 的官方接口；用你“Variant + Mapper”把 Chat 消息转换为 Vertex 的 contents。

	•	Base URL（按区域）：https://{{location}}-aiplatform.googleapis.com
	•	Path（非流式）：{{baseUrl}}/v1/projects/{{project}}/locations/{{location}}/publishers/google/models/{{model}}:generateContent
	•	Path（流式）：...:streamGenerateContent
	•	Auth：Bearer（OAuth2 访问令牌）→ Authorization: Bearer {{apiKey}}
	•	Extra Headers（可选）：x-goog-user-project: {{project}}
	•	Streaming：JSON Lines（或设为 None 用非流式）
	•	Response Mapping
	•	Text：candidates[0].content.parts[*].text（拼接）
	•	Finish：candidates[0].finishReason
	•	请求映射提示：把 messages[] 转为 Vertex 的 {contents:[{role:"user"|"model", parts:[{text:"..."}]}]} 结构。

如果你有 “Google 的 OpenAI 兼容网关”，可直接用“OpenAI 兼容”模板，Auth 改成 x-goog-api-key: {{apiKey}}。
