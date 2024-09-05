/* eslint-disable import/no-extraneous-dependencies */
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { generateText } from 'ai';
import express, { RequestHandler } from 'express';
import { translationContext } from '../utils/constants';

const router = express.Router();

type Params = {
  text: string;
  from: string;
  to: string;
  n: number;
};

type TranslatorResponse = {
  text: string;
};

const translationController: RequestHandler<
  {},
  TranslatorResponse,
  {},
  Params
> = async (req, res) => {
  const {
    text = '',
    from = 'Spanish',
    to = 'English',
    n: naturallityLevel = 1,
  } = req.query;

  const clearText = text.replace(/\s{2,}/g, ' ').trim();

  if (clearText.length === 0)
    return res.status(400).json({ text: 'Text is required' });

  const { text: generatedText } = await generateText({
    model: createGroq({
      apiKey: process.env.GROQ_APIKEY,
      baseURL: process.env.GROQ_BASEURL,
    })('llama-3.1-70b-versatile'),
    system: translationContext,
    prompt: `
      Translate the following text from ${from} to ${to}:
       The translation must be accord this level of naturallity: ${naturallityLevel} 1 is like a native human and 5 is super formal text. 
        For example, "Hello" is formal, "Hi" is informal. Don't care about changing the text, just translate it based on the naturallity level.
      Text: ${text}`,
  });

  const { text: translatedText } = JSON.parse(generatedText) as {
    text: string;
    n: number;
  };

  return res.json({ text: translatedText });
};

router.get('/', translationController);

export default router;
