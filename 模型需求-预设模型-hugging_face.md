预设 3：Hugging Face

A) Inference Endpoints（TGI）OpenAI 兼容（推荐）

需要用 Text Generation Inference (TGI) 驱动的 Inference Endpoint；创建后会给你一个专属域名。

	•	Base URL：你的 Endpoint 根，例如：https://YOUR-ENDPOINT.endpoints.huggingface.cloud
	•	Path Template：{{baseUrl}}/v1/chat/completions
	•	Auth Type：Bearer → Authorization: Bearer {{apiKey}}（HF token）
	•	Streaming：OpenAI SSE
	•	Response Mapping：同 OpenAI（choices[0].message.content）

官方明确：TGI 支持 OpenAI API 兼容 与 SSE 流，返回结构与 OpenAI 相同。 ￼

B) Serverless Inference API（非兼容）
	•	这是 https://api-inference.huggingface.co/models/{model} 的通用推理接口，不是 OpenAI 结构，无法直接用你当前的 Chat Completions 流程；若要接它，需要在“高级区”另设一个 HF Inference 变体（自定义请求体 + 响应映射），一般不如 A 方案直接。

Join the Hugging Face community
and get access to the augmented documentation experience

Collaborate on models, datasets and Spaces
Faster examples with accelerated inference
Switch between documentation themes
Sign Up
to get started

Text to Image
Generate an image based on a given text prompt.

For more details about the text-to-image task, check out its dedicated page! You will find examples and related materials.

Recommended models
black-forest-labs/FLUX.1-Krea-dev: One of the most powerful image generation models that can generate realistic outputs.
Qwen/Qwen-Image: A powerful image generation model.
ByteDance/SDXL-Lightning: Powerful and fast image generation model.
ByteDance/Hyper-SD: A powerful text-to-image model.
Explore all available models and find the one that suits you best here.

Using the API
Language

Client

Provider





Copied
async function query(data) {
	const response = await fetch(
		"https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev",
		{
			headers: {
				Authorization: `Bearer ${({}).HF_TOKEN}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}


query({     inputs: "\"Astronaut riding a horse\"", }).then((response) => {
    // Use image
});
API specification
Request
Headers		
authorization	string	Authentication header in the form 'Bearer: hf_****' when hf_**** is a personal user access token with “Inference Providers” permission. You can generate one from your settings page.
Payload		
inputs*	string	The input text data (sometimes called “prompt”)
parameters	object	
        guidance_scale	number	A higher guidance scale value encourages the model to generate images closely linked to the text prompt, but values too high may cause saturation and other artifacts.
        negative_prompt	string	One prompt to guide what NOT to include in image generation.
        num_inference_steps	integer	The number of denoising steps. More denoising steps usually lead to a higher quality image at the expense of slower inference.
        width	integer	The width in pixels of the output image
        height	integer	The height in pixels of the output image
        scheduler	string	Override the scheduler with a compatible one.
        seed	integer	Seed for the random number generator.
Response
Body		
image	unknown	The generated image returned as raw bytes in the payload.