import { Ollama } from 'ollama/browser'

const ollama = new Ollama({ host: 'http://192.168.0.178:11434/' })


const chat = async (data) => {
  return await ollama.chat({
    model: 'llama3.1:8b',
    messages: [{ role: 'user', content: data + "  (don't use markdown formatting)", }],

  })
}
const vision = async (data, pic) => {
  return await ollama.chat({
    model: 'llava:7b',
    messages: [{ role: 'user', content: data, images: [pic] }],

  })
}
const Olama = { chat, vision };

export default Olama;