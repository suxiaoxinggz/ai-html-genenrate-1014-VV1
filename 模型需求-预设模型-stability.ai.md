StabilityAI REST API (v2beta)
Download OpenAPI specification:Download

Welcome to the Stability Platform API. As of March 2024, we are building the REST v2beta API service to be the primary API service for the Stability Platform. All AI services on other APIs (gRPC, REST v1, RESTv2alpha) will continue to be maintained, however they will not receive new features or parameters.

If you are a REST v2alpha user, we strongly recommend that you adjust the URL calls for the specific services that you are using over to the equivalent REST v2beta URL. Normally, this means simply replacing "v2alpha" with "v2beta". We are not deprecating v2alpha URLs at this time for users that are currently using them.

Authentication
You will need your Stability API key in order to make requests to this API. Make sure you never share your API key with anyone, and you never commit it to a public repository. Include this key in the Authorization header of your requests.

Rate limiting
This API is rate-limited to 150 requests every 10 seconds. If you exceed this limit, you will receive a 429 response and be timed out for 60 seconds. If you find this limit too restrictive, please reach out to us via this form.

Support
Please see our FAQ for answers to common questions. If you have any other questions or concerns, please reach out to us via this form.

To see the health of our APIs, please check our Status Page.

Generate
Tools to generate new images from text, or create variations of existing images. Our different services include:

Stable Image Ultra: Photorealistic, Large-Scale Output

Our state of the art text to image model based on Stable Diffusion 3.5. Stable Image Ultra Produces the highest quality, photorealistic outputs perfect for professional print media and large format applications. Stable Image Ultra excels at rendering exceptional detail and realism.

Stable Image Core: Fast and Affordable

Optimized for fast and aﬀordable image generation, great for rapidly iterating on concepts during ideation. Stable Image Core is the next generation model following Stable Diffusion XL.

Stable Diffusion 3.5 Model Suite: Stability AI's latest base models

The different versions of our open models are available via API, letting you test and adjust speed and quality based on your use case. All model versions strike a balance between generation speed and output quality and are ideal for creating high-volume, high-quality digital assets like websites, newsletters, and marketing materials.

1)Stable Image Ultra
Our most advanced text to image generation service, Stable Image Ultra creates the highest quality images with unprecedented prompt understanding. Ultra excels in typography, complex compositions, dynamic lighting, vibrant hues, and overall cohesion and structure of an art piece. Made from the most advanced models, including Stable Diffusion 3.5, Ultra offers the best of the Stable Diffusion ecosystem.
请求体：
curl -f -sS "https://api.stability.ai/v2beta/stable-image/generate/ultra" \
  -H "authorization: Bearer sk-MYAPIKEY" \
  -H "accept: image/*" \
  -F prompt="Lighthouse on a cliff overlooking the ocean" \
  -F output_format="webp" \
  -o "./lighthouse.webp"

返回体：
{
  "image": "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1...",
  "seed": 343940597,
  "finish_reason": "SUCCESS"
}

Try it out
Grab your API key and head over to Open Google Colab

How to use
Please invoke this endpoint with a POST request.

The headers of the request must include an API key in the authorization field. The body of the request must be multipart/form-data. The accept header should be set to one of the following:

image/* to receive the image in the format specified by the output_format parameter.
application/json to receive the image in the format specified by the output_format parameter, but encoded to base64 in a JSON response.
The only required parameter is the prompt field, which should contain the text prompt for the image generation.

The body of the request should include:

prompt - text to generate the image from
The body may optionally include:

image - the image to use as the starting point for the generation
strength - controls how much influence the image parameter has on the output image
aspect_ratio - the aspect ratio of the output image
negative_prompt - keywords of what you do not wish to see in the output image
seed - the randomness seed to use for the generation
output_format - the format of the output image
Note: for the full list of optional parameters, please see the request schema below.

Output
The resolution of the generated image will be 1 megapixel. The default resolution is 1024x1024.

Credits
The Ultra service uses 8 credits per successful result. You will not be charged for failed results.

Authorizations:
STABILITY_API_KEY
header Parameters
authorization
required
string non-empty
Your Stability API key, used to authenticate your requests. Although you may have multiple keys in your account, you should use the same key for all requests to this API.

content-type
required
string non-empty
Example: multipart/form-data
The content type of the request body. Do not manually specify this header; your HTTP client library will automatically include the appropriate boundary parameter.

accept	
string
Default: image/*
Enum: application/json image/*
Specify image/* to receive the bytes of the image directly. Otherwise specify application/json to receive the image as base64 encoded JSON.

stability-client-id	
string (StabilityClientID) <= 256 characters
Example: my-awesome-app
The name of your application, used to help us communicate app-specific debugging or moderation issues to you.

stability-client-user-id	
string (StabilityClientUserID) <= 256 characters
Example: DiscordUser#9999
A unique identifier for your end user. Used to help us communicate user-specific debugging or moderation issues to you. Feel free to obfuscate this value to protect user privacy.

stability-client-version	
string (StabilityClientVersion) <= 256 characters
Example: 1.2.1
The version of your application, used to help us communicate version-specific debugging or moderation issues to you.

Request Body schema: multipart/form-data
prompt
required
string [ 1 .. 10000 ] characters
What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects will lead to better results.

To control the weight of a given word use the format (word:weight), where word is the word you'd like to control the weight of and weight is a value between 0 and 1. For example: The sky was a crisp (blue:0.3) and (green:0.8) would convey a sky that was blue and green, but more green than blue.

negative_prompt	
string <= 10000 characters
A blurb of text describing what you do not wish to see in the output image. This is an advanced feature.

aspect_ratio	
string
Default: 1:1
Enum: 16:9 1:1 21:9 2:3 3:2 4:5 5:4 9:16 9:21
Controls the aspect ratio of the generated image.

seed	
number [ 0 .. 4294967294 ]
Default: 0
A specific value that is used to guide the 'randomness' of the generation. (Omit this parameter or pass 0 to use a random seed.)

output_format	
string
Default: png
Enum: jpeg png webp
Dictates the content-type of the generated image.

image	
string <binary>
The image to use as the starting point for the generation.

Important: The strength parameter is required when image is provided.

Supported Formats:

jpeg
png
webp
Validation Rules:

Width must be between 64 and 16,384 pixels
Height must be between 64 and 16,384 pixels
Total pixel count must be at least 4,096 pixels
style_preset	
string
Enum: 3d-model analog-film anime cinematic comic-book digital-art enhance fantasy-art isometric line-art low-poly modeling-compound neon-punk origami photographic pixel-art tile-texture
Guides the image model towards a particular style.

strength	
number [ 0 .. 1 ]
Sometimes referred to as denoising, this parameter controls how much influence the image parameter has on the generated image. A value of 0 would yield an image that is identical to the input. A value of 1 would be as if you passed in no image at all.

Important: This parameter is required when image is provided.


返回体
Response Schema: 
application/json; type=image/jpeg
application/json; type=image/jpeg
image
required
string
The generated image, encoded to base64.

finish_reason
required
string
Enum: CONTENT_FILTERED SUCCESS
The reason the generation finished.

SUCCESS = successful generation.
CONTENT_FILTERED = successful generation, however the output violated our content moderation policy and has been blurred as a result.
seed	
number [ 0 .. 4294967294 ]
Default: 0
The seed used as random noise for this generation.
字段名（Key）	类型（Type）	必选 / 可选	核心含义与说明
image	string	必选（required）	生成的图像文件内容，以Base64 编码格式存储（Base64 是将二进制文件转为文本的通用方式，便于 JSON 传输）。
finish_reason	string（枚举类型）	必选（required）	图像生成任务的 “结束原因”，仅 2 种可能值：
- SUCCESS：生成成功，且结果符合内容规范；
- CONTENT_FILTERED：生成技术上成功，但内容违反内容审核政策，最终已被模糊处理。
seed	number	可选（默认 0）	图像生成时使用的 “随机种子”（范围 0-4294967294），用于控制生成结果的可复现性 —— 相同 seed + 相同参数，通常能生成一致的图像，默认值 0 表示使用随机种子。

2）Stable Image Core
Our primary service for text-to-image generation, Stable Image Core represents the best quality achievable at high speed. No prompt engineering is required! Try asking for a style, a scene, or a character, and see what you get.

curl -f -sS "https://api.stability.ai/v2beta/stable-image/generate/core" \
  -H "authorization: Bearer sk-MYAPIKEY" \
  -H "accept: image/*" \
  -F prompt="Lighthouse on a cliff overlooking the ocean" \
  -F output_format="webp" \
  -o "./lighthouse.webp"

返回体：
{
  "image": "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1...",
  "seed": 343940597,
  "finish_reason": "SUCCESS"
}

Try it out
Grab your API key and head over to Open Google Colab

How to use
Please invoke this endpoint with a POST request.

The headers of the request must include an API key in the authorization field. The body of the request must be multipart/form-data, and the accept header should be set to one of the following:

image/* to receive the image in the format specified by the output_format parameter.
application/json to receive the image encoded as base64 in a JSON response.
The body of the request should include:

prompt
The body may optionally include:

aspect_ratio
negative_prompt
seed
style_preset
output_format
Note: for more details about these parameters please see the request schema below.

Output
The resolution of the generated image will be 1.5 megapixels.

Credits
Flat rate of 3 credits per successful generation. You will not be charged for failed generations.

Authorizations:
STABILITY_API_KEY
header Parameters
authorization
required
string non-empty
Your Stability API key, used to authenticate your requests. Although you may have multiple keys in your account, you should use the same key for all requests to this API.

content-type
required
string non-empty
Example: multipart/form-data
The content type of the request body. Do not manually specify this header; your HTTP client library will automatically include the appropriate boundary parameter.

accept	
string
Default: image/*
Enum: application/json image/*
Specify image/* to receive the bytes of the image directly. Otherwise specify application/json to receive the image as base64 encoded JSON.

stability-client-id	
string (StabilityClientID) <= 256 characters
Example: my-awesome-app
The name of your application, used to help us communicate app-specific debugging or moderation issues to you.

stability-client-user-id	
string (StabilityClientUserID) <= 256 characters
Example: DiscordUser#9999
A unique identifier for your end user. Used to help us communicate user-specific debugging or moderation issues to you. Feel free to obfuscate this value to protect user privacy.

stability-client-version	
string (StabilityClientVersion) <= 256 characters
Example: 1.2.1
The version of your application, used to help us communicate version-specific debugging or moderation issues to you.

Request Body schema: multipart/form-data
prompt
required
string [ 1 .. 10000 ] characters
What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects will lead to better results.

To control the weight of a given word use the format (word:weight), where word is the word you'd like to control the weight of and weight is a value between 0 and 1. For example: The sky was a crisp (blue:0.3) and (green:0.8) would convey a sky that was blue and green, but more green than blue.

aspect_ratio	
string
Default: 1:1
Enum: 16:9 1:1 21:9 2:3 3:2 4:5 5:4 9:16 9:21
Controls the aspect ratio of the generated image.

negative_prompt	
string <= 10000 characters
A blurb of text describing what you do not wish to see in the output image. This is an advanced feature.

seed	
number [ 0 .. 4294967294 ]
Default: 0
A specific value that is used to guide the 'randomness' of the generation. (Omit this parameter or pass 0 to use a random seed.)

style_preset	
string
Enum: 3d-model analog-film anime cinematic comic-book digital-art enhance fantasy-art isometric line-art low-poly modeling-compound neon-punk origami photographic pixel-art tile-texture
Guides the image model towards a particular style.

output_format	
string
Default: png
Enum: jpeg png webp
Dictates the content-type of the generated image.




3）Stable Diffusion 3.5
Generate using Stable Diffusion 3.5 models, Stability AI latest base model:

Stable Diffusion 3.5 Large: At 8 billion parameters, with superior quality and prompt adherence, this base model is the most powerful in the Stable Diffusion family. This model is ideal for professional use cases at 1 megapixel resolution.

Stable Diffusion 3.5 Large Turbo: A distilled version of Stable Diffusion 3.5 Large. SD3.5 Large Turbo generates high-quality images with exceptional prompt adherence in just 4 steps, making it considerably faster than Stable Diffusion 3.5 Large.

Stable Diffusion 3.5 Medium: With 2.5 billion parameters, the model delivers an optimal balance between prompt accuracy and image quality, making it an efficient choice for fast high-performance image generation.

Stable Diffusion 3.5 Flash: A distilled version of Stable Diffusion 3.5 Medium. SD3.5 Flash generates high-quality images with a 4 step process instead of 40, making it faster than Stable Diffusion 3.5 Medium.

Read more about the model capabilities here.

As of April 17, 2025, we have deprecated the Stable Diffusion 3.0 APIs and will be automatically re-routing calls to Stable Diffusion 3.0 models to Stable Diffusion 3.5 APIs at no extra cost. You can read more in the release notes.

curl -f -sS "https://api.stability.ai/v2beta/stable-image/generate/sd3" \
  -H "authorization: Bearer sk-MYAPIKEY" \
  -H "accept: image/*" \
  -F prompt="Lighthouse on a cliff overlooking the ocean" \
  -F output_format="jpeg" \
  -o "./lighthouse.jpeg"

返回体：
{
  "image": "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1...",
  "seed": 343940597,
  "finish_reason": "SUCCESS"
}

Try it out
Grab your API key and head over to Open Google Colab

How to use
Please invoke this endpoint with a POST request.

The headers of the request must include an API key in the authorization field. The body of the request must be multipart/form-data. The accept header should be set to one of the following:

image/* to receive the image in the format specified by the output_format parameter.
application/json to receive the image encoded as base64 in a JSON response.
Generating with a prompt
Commonly referred to as text-to-image, this mode generates an image from text alone. While the only required parameter is the prompt, it also supports an aspect_ratio parameter which can be used to control the aspect ratio of the generated image.

Generating with a prompt and an image
Commonly referred to as image-to-image, this mode also generates an image from text but uses an existing image as the starting point. The required parameters are:

prompt - text to generate the image from
image - the image to use as the starting point for the generation
strength - controls how much influence the image parameter has on the output image
mode - must be set to image-to-image
Note: maximum request size is 10MiB.

Optional Parameters:
Both modes support the following optional parameters:

model - the model to use (SD 3.5 Large, SD 3.5 Large Turbo, SD 3.5 Medium, SD 3.5 Flash)
output_format - the format of the output image
seed - the randomness seed to use for the generation
negative_prompt - keywords of what you do not wish to see in the output image
cfg_scale - controls how strictly the diffusion process adheres to the prompt text
style_preset - guides the image model towards a particular style
Note: for more details about these parameters please see the request schema below.

Output
The resolution of the generated image will be 1MP. The default resolution is 1024x1024.

Credits
SD 3.5 Large: Flat rate of 6.5 credits per successful generation.
SD 3.5 Large Turbo: Flat rate of 4 credits per successful generation.
SD 3.5 Medium: Flat rate of 3.5 credits per successful generation.
SD 3.5 Flash: Flat rate of 2.5 credits per successful generation.
As always, you will not be charged for failed generations.

Authorizations:
STABILITY_API_KEY
header Parameters
authorization
required
string non-empty
Your Stability API key, used to authenticate your requests. Although you may have multiple keys in your account, you should use the same key for all requests to this API.

content-type
required
string non-empty
Example: multipart/form-data
The content type of the request body. Do not manually specify this header; your HTTP client library will automatically include the appropriate boundary parameter.

accept	
string
Default: image/*
Enum: application/json image/*
Specify image/* to receive the bytes of the image directly. Otherwise specify application/json to receive the image as base64 encoded JSON.

stability-client-id	
string (StabilityClientID) <= 256 characters
Example: my-awesome-app
The name of your application, used to help us communicate app-specific debugging or moderation issues to you.

stability-client-user-id	
string (StabilityClientUserID) <= 256 characters
Example: DiscordUser#9999
A unique identifier for your end user. Used to help us communicate user-specific debugging or moderation issues to you. Feel free to obfuscate this value to protect user privacy.

stability-client-version	
string (StabilityClientVersion) <= 256 characters
Example: 1.2.1
The version of your application, used to help us communicate version-specific debugging or moderation issues to you.

Request Body schema: multipart/form-data
prompt
required
string [ 1 .. 10000 ] characters
What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects will lead to better results.

mode	
string (GenerationMode)
Default: text-to-image
Enum: image-to-image text-to-image
Controls whether this is a text-to-image or image-to-image generation, which affects which parameters are required:

text-to-image requires only the prompt parameter
image-to-image requires the prompt, image, and strength parameters
image	
string <binary>
The image to use as the starting point for the generation.

Supported formats:

jpeg
png
webp
Supported dimensions:

Every side must be at least 64 pixels
Important: This parameter is only valid for image-to-image requests.

strength	
number [ 0 .. 1 ]
Sometimes referred to as denoising, this parameter controls how much influence the image parameter has on the generated image. A value of 0 would yield an image that is identical to the input. A value of 1 would be as if you passed in no image at all.

Important: This parameter is only valid for image-to-image requests. For SD 3.5 Flash, the best results for image-to-image generation are achieved with a strength between .94 - .97.

aspect_ratio	
string
Default: 1:1
Enum: 16:9 1:1 21:9 2:3 3:2 4:5 5:4 9:16 9:21
Controls the aspect ratio of the generated image. Defaults to 1:1.

Important: This parameter is only valid for text-to-image requests.

model	
string
Default: sd3.5-large
Enum: sd3.5-large sd3.5-large-turbo sd3.5-medium
The model to use for generation.

sd3.5-large requires 6.5 credits per generation
sd3.5-large-turbo requires 4 credits per generation
sd3.5-medium requires 3.5 credits per generation
sd3.5-flash requires 2.5 credits per generation
As of the April 17, 2025, sd3-large, sd3-large-turbo and sd3-medium are re-routed to their sd3.5-[model version] equivalent, at the same price.
seed	
number [ 0 .. 4294967294 ]
Default: 0
A specific value that is used to guide the 'randomness' of the generation. (Omit this parameter or pass 0 to use a random seed.)

output_format	
string
Default: png
Enum: jpeg png webp
Dictates the content-type of the generated image.

style_preset	
string
Enum: 3d-model analog-film anime cinematic comic-book digital-art enhance fantasy-art isometric line-art low-poly modeling-compound neon-punk origami photographic pixel-art tile-texture
Guides the image model towards a particular style.

negative_prompt	
string <= 10000 characters
Keywords of what you do not wish to see in the output image. This is an advanced feature.

cfg_scale	
number [ 1 .. 10 ]
How strictly the diffusion process adheres to the prompt text (higher values keep your image closer to your prompt). The Large and Medium models use a default of 4. The Turbo and Flash model uses a default of 1.