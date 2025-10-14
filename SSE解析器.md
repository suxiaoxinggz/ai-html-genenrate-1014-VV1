// OpenAI 风格：`data: {...}`，最后 `data: [DONE]`
export async function parseOpenAISSEStream(resp: Response, onDelta:(t:string)=>void, onDone:()=>void) {
  const reader = resp.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    for (const chunk of buf.split('\n\n')) {
      if (!chunk.startsWith('data:')) continue;
      const data = chunk.replace(/^data:\s*/, '').trim();
      if (data === '[DONE]') { onDone(); return; }
      try {
        const j = JSON.parse(data);
        const deltas = j?.choices?.map((c:any)=>c?.delta?.content || '').join('');
        if (deltas) onDelta(deltas);
      } catch {}
    }
    buf = buf.endsWith('\n\n') ? '' : buf.slice(buf.lastIndexOf('\n\n')+2);
  }
  onDone();
}

// Anthropic 风格：带 `event:` 行；取 content_block_delta.delta.text
export async function parseAnthropicSSEStream(resp: Response, onDelta:(t:string)=>void, onDone:()=>void) {
  const reader = resp.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    for (const ev of buf.split('\n\n')) {
      const event = /event:\s*(\S+)/.exec(ev)?.[1];
      const data = /data:\s*(.+)/s.exec(ev)?.[1];
      if (event && data) {
        try {
          const j = JSON.parse(data);
          if (event === 'content_block_delta' && j?.delta?.text) onDelta(j.delta.text);
          if (event === 'message_stop') { onDone(); return; }
        } catch {}
      }
    }
    buf = buf.endsWith('\n\n') ? '' : buf.slice(buf.lastIndexOf('\n\n')+2);
  }
  onDone();
}