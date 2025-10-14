这是1.5 inpainting的官方说明，所以是为什么？你不要修改代码，告诉我为什么。

1) @cf/runwayml/stable-diffusion-v1-5-inpainting

Usage
Workers - TypeScript
TypeScript
export interface Env {
  AI: Ai;
}

export default {
  async fetch(request, env): Promise<Response> {

    // Picture of a dog
    const exampleInputImage = await fetch(
      "https://pub-1fb693cb11cc46b2b2f656f51e015a2c.r2.dev/dog.png"
    );

    // Mask of dog
    const exampleMask = await fetch(
      "https://pub-1fb693cb11cc46b2b2f656f51e015a2c.r2.dev/dog-mask.png"
    );

    const inputs = {
      prompt: "Change to a lion",
      image: [...new Uint8Array(await exampleInputImage.arrayBuffer())],
      mask: [...new Uint8Array(await exampleMask.arrayBuffer())],
    };

    const response =
      await env.AI.run(
        "@cf/runwayml/stable-diffusion-v1-5-inpainting",
        inputs
      );

    return new Response(response, {
      headers: {
        "content-type": "image/png",
      },
    });
  },
} satisfies ExportedHandler<Env>;

curl
Terminal window
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting  \
  -X POST  \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"  \
  -d '{ "prompt": "cyberpunk cat" }'

Parameters
* indicates a required field

Input
prompt  required min 1
A text description of the image you want to generate

negative_prompt 
Text describing elements to avoid in the generated image

height  min 256 max 2048
The height of the generated image in pixels

width  min 256 max 2048
The width of the generated image in pixels

image 
For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

image_b64 
For use with img2img tasks. A base64-encoded string of the input image

mask 
An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

num_steps  default 20 max 20
The number of diffusion steps; higher values can improve quality but take longer

strength  default 1
A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image

guidance  default 7.5
Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt

seed 
Random seed for reproducibility of the image generation

Output
The binding returns a ReadableStream with the image in JPEG or PNG format (check the model's output schema).

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "description": "A text description of the image you want to generate"
        },
        "negative_prompt": {
            "type": "string",
            "description": "Text describing elements to avoid in the generated image"
        },
        "height": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The height of the generated image in pixels"
        },
        "width": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The width of the generated image in pixels"
        },
        "image": {
            "type": "array",
            "description": "For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "image_b64": {
            "type": "string",
            "description": "For use with img2img tasks. A base64-encoded string of the input image"
        },
        "mask": {
            "type": "array",
            "description": "An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "num_steps": {
            "type": "integer",
            "default": 20,
            "maximum": 20,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        },
        "strength": {
            "type": "number",
            "default": 1,
            "description": "A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image"
        },
        "guidance": {
            "type": "number",
            "default": 7.5,
            "description": "Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt"
        },
        "seed": {
            "type": "integer",
            "description": "Random seed for reproducibility of the image generation"
        }
    },
    "required": [
        "prompt"
    ]
}

API返回：
{
    "type": "string",
    "contentType": "image/png",
    "format": "binary",
    "description": "The generated image in PNG format"
}

2)@cf/stabilityai/stable-diffusion-xl-base-1.0
Diffusion-based text-to-image generative model by Stability AI. Generates and modify images based on text prompts.

Model Info	
Terms and License	link ↗
More information	link ↗
Beta	Yes
Unit Pricing	$0.00 per step
Usage
Workers - TypeScript
curl
Parameters
* indicates a required field

Input
prompt  required min 1
A text description of the image you want to generate

negative_prompt 
Text describing elements to avoid in the generated image

height  min 256 max 2048
The height of the generated image in pixels

width  min 256 max 2048
The width of the generated image in pixels

image 
For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

image_b64 
For use with img2img tasks. A base64-encoded string of the input image

mask 
An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

num_steps  default 20 max 20
The number of diffusion steps; higher values can improve quality but take longer

strength  default 1
A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image

guidance  default 7.5
Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt

seed 
Random seed for reproducibility of the image generation

Output
The binding returns a ReadableStream with the image in JPEG or PNG format (check the model's output schema).

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "description": "A text description of the image you want to generate"
        },
        "negative_prompt": {
            "type": "string",
            "description": "Text describing elements to avoid in the generated image"
        },
        "height": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The height of the generated image in pixels"
        },
        "width": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The width of the generated image in pixels"
        },
        "image": {
            "type": "array",
            "description": "For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "image_b64": {
            "type": "string",
            "description": "For use with img2img tasks. A base64-encoded string of the input image"
        },
        "mask": {
            "type": "array",
            "description": "An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "num_steps": {
            "type": "integer",
            "default": 20,
            "maximum": 20,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        },
        "strength": {
            "type": "number",
            "default": 1,
            "description": "A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image"
        },
        "guidance": {
            "type": "number",
            "default": 7.5,
            "description": "Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt"
        },
        "seed": {
            "type": "integer",
            "description": "Random seed for reproducibility of the image generation"
        }
    },
    "required": [
        "prompt"
    ]
}

{
    "type": "string",
    "contentType": "image/png",
    "format": "binary",
    "description": "The generated image in PNG format"
}




3）@cf/runwayml/stable-diffusion-v1-5-img2img
Stable Diffusion is a latent text-to-image diffusion model capable of generating photo-realistic images. Img2img generate a new image from an input image with Stable Diffusion.

Model Info	
Terms and License	link ↗
More information	link ↗
Beta	Yes
Unit Pricing	$0.00 per step
Usage
Workers - TypeScript
curl
Terminal window
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/runwayml/stable-diffusion-v1-5-img2img  \
  -X POST  \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"  \
  -d '{ "prompt": "cyberpunk cat" }'

Parameters
* indicates a required field

Input
prompt  required min 1
A text description of the image you want to generate

negative_prompt 
Text describing elements to avoid in the generated image

height  min 256 max 2048
The height of the generated image in pixels

width  min 256 max 2048
The width of the generated image in pixels

image 
For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

image_b64 
For use with img2img tasks. A base64-encoded string of the input image

mask 
An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

num_steps  default 20 max 20
The number of diffusion steps; higher values can improve quality but take longer

strength  default 1
A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image

guidance  default 7.5
Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt

seed 
Random seed for reproducibility of the image generation

Output
The binding returns a ReadableStream with the image in JPEG or PNG format (check the model's output schema).

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "description": "A text description of the image you want to generate"
        },
        "negative_prompt": {
            "type": "string",
            "description": "Text describing elements to avoid in the generated image"
        },
        "height": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The height of the generated image in pixels"
        },
        "width": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The width of the generated image in pixels"
        },
        "image": {
            "type": "array",
            "description": "For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "image_b64": {
            "type": "string",
            "description": "For use with img2img tasks. A base64-encoded string of the input image"
        },
        "mask": {
            "type": "array",
            "description": "An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "num_steps": {
            "type": "integer",
            "default": 20,
            "maximum": 20,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        },
        "strength": {
            "type": "number",
            "default": 1,
            "description": "A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image"
        },
        "guidance": {
            "type": "number",
            "default": 7.5,
            "description": "Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt"
        },
        "seed": {
            "type": "integer",
            "description": "Random seed for reproducibility of the image generation"
        }
    },
    "required": [
        "prompt"
    ]
}

返回体：
{
    "type": "string",
    "contentType": "image/png",
    "format": "binary",
    "description": "The generated image in PNG format"
}


4）@cf/bytedance/stable-diffusion-xl-lightning
SDXL-Lightning is a lightning-fast text-to-image generation model. It can generate high-quality 1024px images in a few steps.

Model Info	
More information	link ↗
Beta	Yes
Unit Pricing	$0.00 per step
Usage
Workers - TypeScript
curl
Terminal window
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/bytedance/stable-diffusion-xl-lightning  \
  -X POST  \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"  \
  -d '{ "prompt": "cyberpunk cat" }'

Parameters
* indicates a required field

Input
prompt  required min 1
A text description of the image you want to generate

negative_prompt 
Text describing elements to avoid in the generated image

height  min 256 max 2048
The height of the generated image in pixels

width  min 256 max 2048
The width of the generated image in pixels

image 
For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

image_b64 
For use with img2img tasks. A base64-encoded string of the input image

mask 
An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

num_steps  default 20 max 20
The number of diffusion steps; higher values can improve quality but take longer

strength  default 1
A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image

guidance  default 7.5
Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt

seed 
Random seed for reproducibility of the image generation

Output
The binding returns a ReadableStream with the image in JPEG or PNG format (check the model's output schema).

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "description": "A text description of the image you want to generate"
        },
        "negative_prompt": {
            "type": "string",
            "description": "Text describing elements to avoid in the generated image"
        },
        "height": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The height of the generated image in pixels"
        },
        "width": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The width of the generated image in pixels"
        },
        "image": {
            "type": "array",
            "description": "For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "image_b64": {
            "type": "string",
            "description": "For use with img2img tasks. A base64-encoded string of the input image"
        },
        "mask": {
            "type": "array",
            "description": "An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "num_steps": {
            "type": "integer",
            "default": 20,
            "maximum": 20,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        },
        "strength": {
            "type": "number",
            "default": 1,
            "description": "A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image"
        },
        "guidance": {
            "type": "number",
            "default": 7.5,
            "description": "Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt"
        },
        "seed": {
            "type": "integer",
            "description": "Random seed for reproducibility of the image generation"
        }
    },
    "required": [
        "prompt"
    ]
}

返回体：
{
    "type": "string",
    "contentType": "image/png",
    "format": "binary",
    "description": "The generated image in PNG format"
}

5）@cf/black-forest-labs/flux-1-schnell
Workers - Returning a data URI - TypeScript
TypeScript
export interface Env {
  AI: Ai;
}

export default {
  async fetch(request, env): Promise<Response> {
    const response = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: 'a cyberpunk lizard',
      seed: Math.floor(Math.random() * 10)
    });
    // response.image is base64 encoded which can be used directly as an <img src=""> data URI
    const dataURI = `data:image/jpeg;charset=utf-8;base64,${response.image}`;
    return Response.json({ dataURI });
  },
} satisfies ExportedHandler<Env>;

Workers - Returning an image - TypeScript
TypeScript
export interface Env {
  AI: Ai;
}

export default {
  async fetch(request, env): Promise<Response> {
    const response = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: 'a cyberpunk lizard',
      seed: Math.floor(Math.random() * 10)
    });
    // Convert from base64 string
    const binaryString = atob(response.image);
    // Create byte representation
    const img = Uint8Array.from(binaryString, (m) => m.codePointAt(0));
    return new Response(img, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  },
} satisfies ExportedHandler<Env>;

curl
Terminal window
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/black-forest-labs/flux-1-schnell  \
  -X POST  \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"  \
  -d '{ "prompt": "cyberpunk cat", "seed": "Random positive integer" }'

Parameters
* indicates a required field

Input
prompt  required min 1 max 2048
A text description of the image you want to generate.

steps  default 4 max 8
The number of diffusion steps; higher values can improve quality but take longer.

Output
image 
The generated image in Base64 format.

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "maxLength": 2048,
            "description": "A text description of the image you want to generate."
        },
        "steps": {
            "type": "integer",
            "default": 4,
            "maximum": 8,
            "description": "The number of diffusion steps; higher values can improve quality but take longer."
        }
    },
    "required": [
        "prompt"
    ]
}

返回体：
{
    "type": "object",
    "contentType": "application/json",
    "properties": {
        "image": {
            "type": "string",
            "description": "The generated image in Base64 format."
        }
    }
}

6）@cf/lykon/dreamshaper-8-lcm
curl
Terminal window
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/lykon/dreamshaper-8-lcm  \
  -X POST  \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"  \
  -d '{ "prompt": "cyberpunk cat" }'

Parameters
* indicates a required field

Input
prompt  required min 1
A text description of the image you want to generate

negative_prompt 
Text describing elements to avoid in the generated image

height  min 256 max 2048
The height of the generated image in pixels

width  min 256 max 2048
The width of the generated image in pixels

image 
For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

image_b64 
For use with img2img tasks. A base64-encoded string of the input image

mask 
An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values

items 
A value between 0 and 255

num_steps  default 20 max 20
The number of diffusion steps; higher values can improve quality but take longer

strength  default 1
A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image

guidance  default 7.5
Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt

seed 
Random seed for reproducibility of the image generation

Output
The binding returns a ReadableStream with the image in JPEG or PNG format (check the model's output schema).

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "description": "A text description of the image you want to generate"
        },
        "negative_prompt": {
            "type": "string",
            "description": "Text describing elements to avoid in the generated image"
        },
        "height": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The height of the generated image in pixels"
        },
        "width": {
            "type": "integer",
            "minimum": 256,
            "maximum": 2048,
            "description": "The width of the generated image in pixels"
        },
        "image": {
            "type": "array",
            "description": "For use with img2img tasks. An array of integers that represent the image data constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "image_b64": {
            "type": "string",
            "description": "For use with img2img tasks. A base64-encoded string of the input image"
        },
        "mask": {
            "type": "array",
            "description": "An array representing An array of integers that represent mask image data for inpainting constrained to 8-bit unsigned integer values",
            "items": {
                "type": "number",
                "description": "A value between 0 and 255"
            }
        },
        "num_steps": {
            "type": "integer",
            "default": 20,
            "maximum": 20,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        },
        "strength": {
            "type": "number",
            "default": 1,
            "description": "A value between 0 and 1 indicating how strongly to apply the transformation during img2img tasks; lower values make the output closer to the input image"
        },
        "guidance": {
            "type": "number",
            "default": 7.5,
            "description": "Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt"
        },
        "seed": {
            "type": "integer",
            "description": "Random seed for reproducibility of the image generation"
        }
    },
    "required": [
        "prompt"
    ]
}
返回体：
{
    "type": "string",
    "contentType": "image/png",
    "format": "binary",
    "description": "The generated image in PNG format"
}

7）@cf/leonardo/phoenix-1.0
curl
Terminal window
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/leonardo/phoenix-1.0  \
  -X POST  \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"  \
  -d '{ "prompt": "cyberpunk cat" }'

Parameters
* indicates a required field

Input
prompt  required min 1
A text description of the image you want to generate.

guidance  default 2 min 2 max 10
Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt

seed  min 0
Random seed for reproducibility of the image generation

height  default 1024 min 0 max 2048
The height of the generated image in pixels

width  default 1024 min 0 max 2048
The width of the generated image in pixels

num_steps  default 25 min 1 max 50
The number of diffusion steps; higher values can improve quality but take longer

negative_prompt  min 1
Specify what to exclude from the generated images

Output
The binding returns a ReadableStream with the image in JPEG or PNG format (check the model's output schema).

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "description": "A text description of the image you want to generate."
        },
        "guidance": {
            "type": "number",
            "default": 2,
            "minimum": 2,
            "maximum": 10,
            "description": "Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt"
        },
        "seed": {
            "type": "integer",
            "minimum": 0,
            "description": "Random seed for reproducibility of the image generation"
        },
        "height": {
            "type": "integer",
            "minimum": 0,
            "maximum": 2048,
            "default": 1024,
            "description": "The height of the generated image in pixels"
        },
        "width": {
            "type": "integer",
            "minimum": 0,
            "maximum": 2048,
            "default": 1024,
            "description": "The width of the generated image in pixels"
        },
        "num_steps": {
            "type": "integer",
            "default": 25,
            "minimum": 1,
            "maximum": 50,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        },
        "negative_prompt": {
            "type": "string",
            "minLength": 1,
            "description": "Specify what to exclude from the generated images"
        }
    },
    "required": [
        "prompt"
    ]
}
返回体：
{
    "type": "string",
    "contentType": "image/jpeg",
    "format": "binary",
    "description": "The generated image in JPEG format"
}

8）@cf/leonardo/lucid-origin
Usage
Workers - TypeScript
TypeScript
export interface Env {
  AI: Ai;
}

export default {
  async fetch(request, env): Promise<Response> {

    const inputs = {
      prompt: "cyberpunk cat",
    };

    const response = await env.AI.run(
      "@cf/leonardo/lucid-origin",
      inputs
    );

    return new Response(response, {
      headers: {
        "content-type": "image/jpg",
      },
    });
  },
} satisfies ExportedHandler<Env>;

curl
Terminal window
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/leonardo/lucid-origin  \
  -X POST  \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"  \
  -d '{ "prompt": "cyberpunk cat" }'

Parameters
* indicates a required field

Input
prompt  required min 1
A text description of the image you want to generate.

guidance  default 4.5 min 0 max 10
Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt

seed  min 0
Random seed for reproducibility of the image generation

height  default 1120 min 0 max 2500
The height of the generated image in pixels

width  default 1120 min 0 max 2500
The width of the generated image in pixels

num_steps  min 1 max 40
The number of diffusion steps; higher values can improve quality but take longer

steps  min 1 max 40
The number of diffusion steps; higher values can improve quality but take longer

Output
image 
The generated image in Base64 format.

API Schemas
The following schemas are based on JSON Schema

Input
Output
{
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "minLength": 1,
            "description": "A text description of the image you want to generate."
        },
        "guidance": {
            "type": "number",
            "default": 4.5,
            "minimum": 0,
            "maximum": 10,
            "description": "Controls how closely the generated image should adhere to the prompt; higher values make the image more aligned with the prompt"
        },
        "seed": {
            "type": "integer",
            "minimum": 0,
            "description": "Random seed for reproducibility of the image generation"
        },
        "height": {
            "type": "integer",
            "minimum": 0,
            "maximum": 2500,
            "default": 1120,
            "description": "The height of the generated image in pixels"
        },
        "width": {
            "type": "integer",
            "minimum": 0,
            "maximum": 2500,
            "default": 1120,
            "description": "The width of the generated image in pixels"
        },
        "num_steps": {
            "type": "integer",
            "minimum": 1,
            "maximum": 40,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        },
        "steps": {
            "type": "integer",
            "minimum": 1,
            "maximum": 40,
            "description": "The number of diffusion steps; higher values can improve quality but take longer"
        }
    },
    "required": [
        "prompt"
    ]
}

返回体：
{
    "type": "object",
    "contentType": "application/json",
    "properties": {
        "image": {
            "type": "string",
            "description": "The generated image in Base64 format."
        }
    }
}

