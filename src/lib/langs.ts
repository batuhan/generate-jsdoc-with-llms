export const LANGUAGE_EXTENSION_MAP = {
  javascript: ["js", "mjs", "cjs"],
} as const;

export const EXTENSION_TO_LANG_MAP = Object.entries(LANGUAGE_EXTENSION_MAP).reduce((acc, [lang, extensions]) => {
  extensions.forEach((ext) => {
    acc[ext] = lang;
  });
  return acc;
}, {} as Record<string, string>);
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_EXTENSION_MAP);
