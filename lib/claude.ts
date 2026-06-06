import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface ParsedTask {
  text: string
  priority: 'must' | 'nice'
  duration_min: number
  deadline: string | null
}

export async function parseBrainDump(input: string): Promise<ParsedTask[]> {
  const today = new Date().toISOString().split('T')[0]

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a task parser. Convert the following brain dump into a structured JSON array of tasks.
Today's date: ${today}

Rules:
- Extract each distinct task or to-do
- Set priority to "must" if the task is time-sensitive, has a deadline, or seems important; otherwise "nice"
- Estimate duration in minutes (realistic, not optimistic)
- Extract deadline as ISO 8601 timestamp if a date/time is mentioned; otherwise null
- Return ONLY valid JSON, no explanation

Output format:
[
  {
    "text": "task description",
    "priority": "must" | "nice",
    "duration_min": number,
    "deadline": "ISO timestamp" | null
  }
]

Brain dump:
${input}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const jsonMatch = content.text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array found in response')

  return JSON.parse(jsonMatch[0]) as ParsedTask[]
}
