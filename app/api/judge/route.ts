import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { title, screenshot, description } = await request.json()

    // TODO: Actually pass the screenshot to Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are judging a hackathon project for an "AI for Epistemics" hackathon. The goal is to use AI to help people think better, learn better, or make better decisions.

Project details:
Title: ${title}
Description: ${description}
${screenshot ? 'Screenshot URL: ' + screenshot : ''}

Please provide about 3 sentences of feedback on how well this project might score, considering:
1. How well it addresses the hackathon theme
2. Technical implementation and innovation
3. Potential impact

End with a score out of 10 in the format "Score: X/10"`,
        },
      ],
    })

    console.log('response', response)

    return NextResponse.json({
      feedback: response.content[0].text,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to get feedback from Claude' },
      { status: 500 }
    )
  }
}
