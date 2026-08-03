import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm"

// Initialize the WebWorkerMLCEngineHandler to process RPC calls from the main thread engine
const handler = new WebWorkerMLCEngineHandler()

self.onmessage = (event: MessageEvent) => {
  handler.onmessage(event)
}
