import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Refactor } from "./refactor";

export const args = yargs(hideBin(process.argv))
  .options({
    openaiApiKey: {
      describe: "OpenAI API key",
      type: "string",
      demandOption: true,
      default: process.env.OPENAI_API_KEY,
    },
    src: {
      describe: "Source directory or git repository",
      type: "string",
      demandOption: true,
    },
    dest: {
      describe: "Destination directory",
      type: "string",
      demandOption: true,
    }
  })
  .parseSync();

const ref = new Refactor();
ref.refactor();
