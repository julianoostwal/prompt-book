"use server";

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function askai(question: string) {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: question }],
    model: 'gpt-3.5-turbo-0125',
  });
  return chatCompletion.choices[0].message.content;
}
