import { Configuration, OpenAIApi } from "openai";
import { args } from "../index";
import { GPT4Tokenizer } from "gpt4-tokenizer";
import axios from "axios";
export class OpenAIClient {
  openai: OpenAIApi;
  opts: typeof args = args;
  encoder: GPT4Tokenizer;

  constructor() {
    const configuration = new Configuration({
      apiKey: this.opts.openaiApiKey,
    });
    this.openai = new OpenAIApi(configuration);
    this.encoder = new GPT4Tokenizer({ type: "gpt3" }); // or 'codex'
  }

  private getInitialPromptForFile = (path: string): string => {
    return `You are a senior software engineer who is tasked with adding detailed JSDoc with description, arguments and return types to JavaScript files. You are working on the file at path ${path}. Do not reply with ANYTHING besides the source code with JSDoc added wherever possible. Make SURE the syntax is correct, and the code matches the source code exactly. Do NOT include any markdown syntax. Do NOT include any explanations, or any other text besides the source code.`;
  };

  private checkPromptLength = (prompt: string): number => {
    const encoded = this.encoder.encode(prompt);
    return encoded.bpe.length;
  };

  private runCompletion = async (prompt: string): Promise<string | undefined | null> => {
    try {
      const completion = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      const text = completion.data.choices[0]?.message;
      const sourceCode = text?.content;
      if (!sourceCode) {
        return undefined;
      }
      if (sourceCode.startsWith("```")) {
        return sourceCode.split("\n").slice(1, -1).join("\n");
      }
      return sourceCode;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        // axios error logger
        console.error(e.response?.status);
        console.error(e.response?.data);
      } else {
        console.error(e);
      }
      return null;
    }
  };
  transformCode = async (sourceCode: string, path: string): Promise<string | undefined | null> => {
    const initialPrompt = this.getInitialPromptForFile(path);

    const chunked = this.encoder.chunkText(sourceCode, 7000);
    if (chunked.length > 1) {
      // we need to split it up - in the future lets do this more intelligently
    }
    let fullSource = "";
    for (const textChunk of chunked) {
      const subPrompt =
        chunked.length === 1
          ? "The following is the contents of the file:"
          : "The following is a partial file, with the start or end omitted. Ignore any syntax errors, and convert the code exactly as is:";
      const prompt = `${initialPrompt}
    ${subPrompt}\n\n${textChunk}`;
      const completion = await this.runCompletion(prompt);
      fullSource += completion;
    }
    return fullSource;
  };
}
