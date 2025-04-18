// Load level-based word lists (level1.json through level5.json)
export const loadLevelWords = (level: number): Promise<string[]> =>
  import(`./level${level}.json`).then(mod => (mod.default || mod) as string[]);
