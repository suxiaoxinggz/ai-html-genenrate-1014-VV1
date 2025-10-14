无服务器推理 API
作者：Andrew Reed

Hugging Face 提供了一个 无服务器推理 API，用户可以通过简单的 API 调用，快速测试和评估成千上万的公开（或你自己私有授权的）机器学习模型，完全免费！

在这个 Notebook 示例中，我们将演示几种不同的方式，帮助你使用无服务器推理 API，涵盖多个任务，包括：

使用开放的 LLM 生成文本
使用稳定扩散生成图像
使用视觉语言模型（VLM）对图像进行推理
将文本转换为语音
目标是帮助你快速入门，了解基本操作！

[!提示]
由于我们提供免费的无服务器推理 API，常规 Hugging Face 用户有请求次数限制（每小时约几百次）。如果需要更高的请求频率，可以 升级为 PRO 账户，每月仅需 $9。然而，对于高流量的生产推理工作负载，请查看我们的 专用推理端点 解决方案。

开始使用
要开始使用无服务器推理 API，你需要一个 Hugging Face Hub 个人资料：如果你没有个人资料，可以 注册，如果已经有了个人资料，请 登录。

接下来，你需要创建一个 用户访问令牌。一个具有 read 或 write 权限的令牌即可使用。然而，我们强烈建议使用细粒度的令牌。

[!提示]
对于本 Notebook，你需要一个具有 Inference > Make calls to the serverless Inference API 用户权限的细粒度令牌，同时需要对 meta-llama/Meta-Llama-3-8B-Instruct 和 HuggingFaceM4/idefics2-8b-chatty 仓库具有读取权限，因为我们必须下载它们的分词器以运行此笔记本。

完成这些步骤后，我们可以安装所需的包，并使用用户访问令牌进行 Hub 身份验证。

Copied
%pip install -U huggingface_hub transformers
Copied
import os
from huggingface_hub import interpreter_login, whoami, get_token

# running this will prompt you to enter your Hugging Face credentials
interpreter_login()
[!提示]
我们在上面使用了 interpreter_login() 方法来编程方式登录 Hub。作为替代方法，我们还可以使用其他方法，例如来自 Hub Python 库 的 notebook_login()，或者使用 Hugging Face CLI 工具 中的 login 命令。

现在，让我们使用 whoami() 来验证我们是否已正确登录，它会打印出当前的用户名以及您的个人资料所属的组织。

Copied
whoami()
查询无服务器推理 API
无服务器推理 API 通过一个简单的 API 提供 Hub 上的模型：

https://api-inference.huggingface.co/models/<MODEL_ID>

其中 <MODEL_ID> 对应于 Hub 上模型仓库的名称。

例如，codellama/CodeLlama-7b-hf 对应的 URL 是 https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-hf。

使用 HTTP 请求
我们可以通过简单的 POST 请求，使用 requests 库轻松调用这个 API。

Copied
import requests

API_URL = "https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-hf"
HEADERS = {"Authorization": f"Bearer {get_token()}"}


def query(payload):
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    return response.json()


print(
    query(
        payload={
            "inputs": "A HTTP POST request is used to ",
            "parameters": {"temperature": 0.8, "max_new_tokens": 50, "seed": 42},
        }
    )
)
[&#123;'generated_text': 'A HTTP POST request is used to send data to a web server.\n\n# Example\n```javascript\npost("localhost:3000", &#123;foo: "bar"})\n  .then(console.log => console.log(\'success\'))\n```\n\n'}]
太棒了！API 回应了我们输入的提示的延续。但你可能会好奇……API 是如何知道如何处理负载的？作为用户，我如何知道给定模型可以传递哪些参数呢？

实际上，在后台，无服务器推理 API 会将请求的模型动态加载到共享计算基础设施上，以提供预测。当模型加载完毕后，Serverless 推理 API 会使用模型卡中的指定 pipeline_tag（请参见 这里）来确定适当的推理任务。你可以参考相应的 任务 或 pipeline 文档，以查找允许的参数。

[!提示]
如果请求的模型在请求时尚未加载到内存中（这取决于该模型的最近请求），无服务器推理 API 将最初返回 503 响应，然后再成功地返回预测结果。稍等片刻后再试，给模型一些启动时间。
你还可以通过 InferenceClient().list_deployed_models() 来查看任何时刻已加载并可用的模型。

使用 huggingface_hub Python 库
要在 Python 中发送请求，你可以利用 InferenceClient，这是 huggingface_hub Python 库中提供的一个便捷工具，使你能够轻松调用无服务器推理 API。

Copied
from huggingface_hub import InferenceClient

client = InferenceClient()
response = client.text_generation(
    prompt="A HTTP POST request is used to ",
    model="codellama/CodeLlama-7b-hf",
    temperature=0.8,
    max_new_tokens=50,
    seed=42,
    return_full_text=True,
)
print(response)
A HTTP POST request is used to send data to a web server.

# Example
```javascript
post("localhost:3000", &#123;foo: "bar"})
  .then(console.log => console.log('success'))
```
请注意，在使用 InferenceClient 时，我们只需要指定模型 ID，并且直接在 text_generation() 方法中传递参数。我们可以轻松检查该函数的签名，以查看如何使用该任务及其允许的参数的更多详细信息。

Copied
# uncomment the following line to see the function signature
# help(client.text_generation)
[!提示]
除了 Python，你还可以使用 JavaScript 在你的 JS 或 Node 应用中集成推理调用。查看 huggingface.js 以开始使用。

应用实例
现在我们已经了解了无服务器推理 API 的工作原理，让我们开始实际操作，并在过程中学习一些技巧。

1. 使用开源 LLM 生成文本
文本生成是一个非常常见的应用场景。然而，与开源 LLM 互动时，有一些细微之处需要理解，以避免性能悄然下降。对于文本生成，底层的语言模型可能有几种不同的类型：

基础模型（Base models）： 指的是纯粹的、预训练的语言模型，例如 codellama/CodeLlama-7b-hf 或 meta-llama/Meta-Llama-3-8B。这些模型擅长根据提供的提示继续生成文本（如我们在上面的示例中看到的）。然而，它们并未针对对话场景进行微调，例如回答问题。
指令微调模型（Instruction-tuned models）： 这些模型经过多任务训练，能够执行广泛的指令，例如“写一份巧克力蛋糕的食谱”。像 meta-llama/Meta-Llama-3-8B-Instruct 或 mistralai/Mistral-7B-Instruct-v0.3 这样的模型即是如此训练的。指令微调模型在回应指令时比基础模型表现更好。通常，这些模型也会针对多轮对话进行微调，使其非常适合对话型应用。
理解这些细微差别非常重要，因为它们会影响我们如何查询特定的模型。指令微调模型使用的是针对模型特定的 对话模板，因此你需要小心模型期望的格式，并在查询中尽量复制这一格式。

例如，meta-llama/Meta-Llama-3-8B-Instruct 使用以下提示结构来区分系统、用户和助手之间的对话回合：

Copied
<|begin_of_text|><|start_header_id|>system<|end_header_id|>

{{ system_prompt }}<|eot_id|><|start_header_id|>user<|end_header_id|>

{{ user_msg_1 }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{{ model_answer_1 }}<|eot_id|>
这些特殊的标记和提示格式会因模型而异。为了确保我们使用正确的格式，我们可以通过模型的 对话模板 结合其分词器来进行检查，如下所示。

Copied
from transformers import AutoTokenizer

# define the system and user messages
system_input = "You are an expert prompt engineer with artistic flair."
user_input = "Write a concise prompt for a fun image containing a llama and a cookbook. Only return the prompt."
messages = [
    {"role": "system", "content": system_input},
    {"role": "user", "content": user_input},
]

# load the model and tokenizer
model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)

# apply the chat template to the messages
prompt = tokenizer.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
)
print(f"\nPROMPT:\n-----\n\n{prompt}")
PROMPT:
-----

<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are an expert prompt engineer with artistic flair.<|eot_id|><|start_header_id|>user<|end_header_id|>

Write a concise prompt for a fun image containing a llama and a cookbook. Only return the prompt.<|eot_id|><|start_header_id|>assistant<|end_header_id|>
请注意，apply_chat_template() 方法是如何将我们熟悉的消息列表转换成模型期望的正确格式化字符串的。我们可以使用这个格式化后的字符串，作为参数传递给无服务器推理 API 的 text_generation 方法。

Copied
llm_response = client.text_generation(
    prompt, model=model_id, max_new_tokens=250, seed=42
)
print(llm_response)
"A whimsical illustration of a llama proudly holding a cookbook, with a sassy expression and a sprinkle of flour on its nose, surrounded by a colorful kitchen backdrop with utensils and ingredients scattered about, as if the llama is about to whip up a culinary masterpiece."
查询一个 LLM 而不遵循模型的提示模板 不会 直接产生错误！但是，这将导致输出质量较差。来看一下当我们传递相同的系统和用户输入，但 没有 根据对话模板格式化时，会发生什么情况。

Copied
out = client.text_generation(
    system_input + " " + user_input, model=model_id, max_new_tokens=250, seed=42
)
print(out)
Do not write the... 1 answer below »

You are an expert prompt engineer with artistic flair. Write a concise prompt for a fun image containing a llama and a cookbook. Only return the prompt. Do not write the image description.

A llama is sitting at a kitchen table, surrounded by cookbooks and utensils, with a cookbook open in front of it. The llama is wearing a chef's hat and holding a spatula. The cookbook is titled "Llama's Favorite Recipes" and has a llama on the cover. The llama is surrounded by a warm, golden light, and the kitchen is filled with the aroma of freshly baked bread. The llama is smiling and looking directly at the viewer, as if inviting them to join in the cooking fun. The image should be colorful, whimsical, and full of texture and detail. The llama should be the main focus of the image, and the cookbook should be prominently displayed. The background should be a warm, earthy color, such as terracotta or sienna. The overall mood of the image should be playful, inviting, and joyful. 1 answer below »

You are an expert prompt engineer with artistic flair. Write a concise prompt for a fun image containing a llama and a
哎呀！LLM 产生了一个无意义的开头，意外地重复了提示，并且未能保持简洁。为了简化提示过程并确保使用正确的对话模板，InferenceClient 还提供了一个 chat_completion 方法，它抽象化了 chat_template 的细节。这使得你可以简单地传递一组消息：

Copied
for token in client.chat_completion(
    messages, model=model_id, max_tokens=250, stream=True, seed=42
):
    print(token.choices[0].delta.content)
"A
 whims
ical
 illustration
 of
 a
 fashion
ably
 dressed
 llama
 proudly
 holding
 a
 worn
,
 vintage
 cookbook
,
 with
 a
 warm
 cup
 of
 tea
 and
 a
 few
 freshly
 baked
 treats
 scattered
 around
,
 set
 against
 a
 cozy
 background
 of
 rustic
 wood
 and
 blo
oming
 flowers
."
流式传输
在上面的示例中，我们还设置了 stream=True 来启用从端点流式传输文本。为了了解更多类似的功能以及查询 LLM 时的最佳实践，推荐阅读以下支持资源：

如何生成文本：使用 Transformers 的不同解码方法进行语言生成
文本生成策略
PRO 用户推理 - 特别是关于 控制文本生成 部分
Inference Client 文档
2. 使用稳定扩散生成图像
无服务器推理 API 可以用于 许多不同的任务。在这里，我们将使用它来通过稳定扩散（Stable Diffusion）生成图像。

Copied
image = client.text_to_image(
    prompt=llm_response,
    model="stabilityai/stable-diffusion-xl-base-1.0",
    guidance_scale=8,
    seed=42,
)

display(image.resize((image.width // 2, image.height // 2)))
print("PROMPT: ", llm_response)
缓存
InferenceClient 默认会缓存 API 响应。这意味着，如果你使用相同的负载多次查询 API，你会发现返回的结果是完全相同的。来看一下：

Copied
image = client.text_to_image(
    prompt=llm_response,
    model="stabilityai/stable-diffusion-xl-base-1.0",
    guidance_scale=8,
    seed=42,
)

display(image.resize((image.width // 2, image.height // 2)))
print("PROMPT: ", llm_response)
要强制每次都返回不同的响应，我们可以使用一个 HTTP 头部让客户端忽略缓存并重新生成内容：x-use-cache: 0。

Copied
# turn caching off
client.headers["x-use-cache"] = "0"

# generate a new image with the same prompt
image = client.text_to_image(
    prompt=llm_response,
    model="stabilityai/stable-diffusion-xl-base-1.0",
    guidance_scale=8,
    seed=42,
)

display(image.resize((image.width // 2, image.height // 2)))
print("PROMPT: ", llm_response)
3. 使用 Idefics2 进行图像推理
视觉语言模型（VLMs）可以同时接受文本和图像作为输入，并产生文本作为输出。这使得它们能够处理许多任务，从视觉问答到图像描述。我们将使用无服务器推理 API 来查询 Idefics2，这是一款强大的 8B 参数 VLM，让它为我们生成一首关于新生成图像的诗。

首先，我们需要将我们的 PIL 图像转换为 base64 编码的字符串，以便通过网络将其发送给模型。

Copied
import base64
from io import BytesIO


def pil_image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str


image_b64 = pil_image_to_base64(image)
接下来，我们需要使用对话模板正确格式化我们的文本 + 图像提示。请参阅 Idefics2 模型卡 获取有关提示格式的具体细节。

Copied
from transformers import AutoProcessor

# load the processor
vlm_model_id = "HuggingFaceM4/idefics2-8b-chatty"
processor = AutoProcessor.from_pretrained(vlm_model_id)

# define the user messages
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image"},
            {"type": "text", "text": "Write a short limerick about this image."},
        ],
    },
]

# apply the chat template to the messages
prompt = processor.apply_chat_template(messages, add_generation_prompt=True)

# add the base64 encoded image to the prompt
image_input = f"data:image/jpeg;base64,{image_b64}"
image_input = f"![]({image_input})"
prompt = prompt.replace("<image>", image_input)
最后，我们调用无服务器 API 来获取预测。在我们的例子中，得到的是一首关于我们生成图像的有趣打油诗！

Copied
limerick = client.text_generation(
    prompt, model=vlm_model_id, max_new_tokens=200, seed=42
)
print(limerick)
In the heart of a kitchen, so bright and so clean,
Lived a llama named Lulu, quite the culinary queen.
With a book in her hand, she'd read and she'd cook,
Her recipes were magic, her skills were so nook.
In her world, there was no room for defeat,
For Lulu, the kitchen was where she'd meet.
4. 从文本生成语音
最后，让我们使用一个基于 Transformers 的文本到音频模型，叫做 Bark，为我们的诗生成可听的配音。

Copied
tts_model_id = "suno/bark"
speech_out = client.text_to_speech(text=limerick, model=tts_model_id)
Copied
from IPython.display import Audio

display(Audio(speech_out, rate=24000))
print(limerick)
In the heart of a kitchen, so bright and so clean,
Lived a llama named Lulu, quite the culinary queen.
With a book in her hand, she'd read and she'd cook,
Her recipes were magic, her skills were so nook.
In her world, there was no room for defeat,
For Lulu, the kitchen was where she'd meet.
下一步
就这样！在本 Notebook 中，我们学习了如何使用无服务器推理 API 查询各种强大的 Transformer 模型。我们只是触及了它的一部分功能，建议你查看 文档，了解更多可能的功能。