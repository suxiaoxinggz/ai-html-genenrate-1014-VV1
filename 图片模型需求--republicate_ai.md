1. black-forest-labs/flux-schnell

Set the **`REPLICATE_API_TOKEN`** environment variable

```bash
export REPLICATE_API_TOKEN=r8_A6H**********************************
```

VisibilityCopy

[**Learn more about authentication**](https://replicate.com/black-forest-labs/flux-schnell/api/learn-more#authentication)

Run **black-forest-labs/flux-schnell** using Replicate’s API. Check out the model's [**schema**](https://replicate.com/black-forest-labs/flux-schnell/api/schema) for an overview of inputs and outputs.

`curl --silent --show-error https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions \
	--request POST \
	--header "Authorization: Bearer $REPLICATE_API_TOKEN" \
	--header "Content-Type: application/json" \
	--header "Prefer: wait" \
	--data @- <<'EOM'
{
	"input": {
      "prompt": "black forest gateau cake spelling out the words \"FLUX SCHNELL\", tasty, food photography, dynamic shot"
	}
}
EOM`

2） black-forest-labs/flux-dev

Set the **`REPLICATE_API_TOKEN`** environment variable

```bash
export REPLICATE_API_TOKEN=r8_A6H**********************************
```

VisibilityCopy

[**Learn more about authentication**](https://replicate.com/black-forest-labs/flux-dev/api/learn-more#authentication)

Run **black-forest-labs/flux-dev** using Replicate’s API. Check out the model's [**schema**](https://replicate.com/black-forest-labs/flux-dev/api/schema) for an overview of inputs and outputs.

`curl --silent --show-error https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions \
	--request POST \
	--header "Authorization: Bearer $REPLICATE_API_TOKEN" \
	--header "Content-Type: application/json" \
	--header "Prefer: wait" \
	--data @- <<'EOM'
{
	"input": {
      "prompt": "black forest gateau cake spelling out the words \"FLUX DEV\", tasty, food photography, dynamic shot"
	}
}
EOM`

3） black-forest-labs/flux-1.1-pro

Set the **`REPLICATE_API_TOKEN`** environment variable

```bash
export REPLICATE_API_TOKEN=r8_A6H**********************************
```

VisibilityCopy

[**Learn more about authentication**](https://replicate.com/black-forest-labs/flux-1.1-pro/api/learn-more#authentication)

Run **black-forest-labs/flux-1.1-pro** using Replicate’s API. Check out the model's [**schema**](https://replicate.com/black-forest-labs/flux-1.1-pro/api/schema) for an overview of inputs and outputs.

`curl --silent --show-error https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions \
	--request POST \
	--header "Authorization: Bearer $REPLICATE_API_TOKEN" \
	--header "Content-Type: application/json" \
	--header "Prefer: wait" \
	--data @- <<'EOM'
{
	"input": {
      "prompt": "black forest gateau cake spelling out the words \"FLUX 1 . 1 Pro\", tasty, food photography",
      "prompt_upsampling": true
	}
}
EOM`