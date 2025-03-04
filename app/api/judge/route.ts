import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const ABOUT_HACKATHON = `
**AI for epistemics** is about helping to leverage AI for better truthseeking mechanisms — at the level of individual users, the whole of society, or in transparent ways within the AI systems themselves.

For [the hackathon](https://partiful.com/e/Let3xEOCXb32kNYORGT2), we have three broad categories. Within each category, we’ll give a couple of example projects (each of these is expanded on in a tab — see doc navigation on the left). These are things we’d be excited to see, and if you want to run with one of those, that seems great! But variations or completely different ideas might be even better!

Tools for Thought
-----------------

AI systems could help people to think things through — to deepen their understanding and come to a more accurate sense of what they should be doing.

Example projects:

*   Honest Friend — A system that will skewer a piece of writing in its review, going after its weakest points, but do so in an open, friendly, and constructive way
*   Crux Finder — A system which helps two people who have a disagreement to quickly get to the bottom of the disagreement

Tools for Awareness
-------------------

There is a massive amount of information in the world, and that is presented to us as we browse the internet. AI could help us to make sense of this.

Example projects:

*   Argument Parser — A system that takes a written text and maps out what its arguments actually consist of … what the implicit assumptions are, which pieces of evidence are offered in support of which conclusions, etc.
*   Community Notes for Everything — Community Notes on Twitter/X seem like a great example of an epistemic intervention. An AI system could potentially simulate this process, and provide the information _that would have been surfaced by community notes_ on any tweet … or more broadly on any sentence or paragraph on any website.

Epistemic Evals
---------------

We only get what we can measure. Even if people want epistemically virtuous AI systems, that won’t happen unless we can assess what it means to be epistemically virtuous. Epistemic evals could be used as a research development tool; they could also be used to create public pressure to make systems better on the measured dimensions.

Example projects:

*   Pedantry Metrics — It’s possible to use language to distort, mislead, or paper over things. It would be nice to train systems that would go out of their way to avoid doing that. Could we assess performance on this?
*   Sycophancy Evals — Various research shows LLMs are often sycophantic in various ways. But could we automate assessment, so that there’s a go-to place on the internet which routinely scores publicly available systems?`

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

Please provide 2-3 sentences of feedback on how well this project scores, considering:
1. How suitable it is for an AI for Epistemics hackathon
2. Technical implementation and product execution
3. Potential impact

Use plain, simple, direct language, of the kind Paul Graham might use in an essay.

End with a score out of 10 in the format "Score: X/10."

Here is more context on the hackathon:
${ABOUT_HACKATHON}`,
        },
      ],
    })

    console.log('response', response)

    return NextResponse.json({
      // @ts-ignore
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
