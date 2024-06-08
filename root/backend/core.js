import { readFile, writeFile } from 'node:fs/promises';
import { config } from "dotenv"
import { z } from "zod"

export const data = Object.assign(Object.create(null), JSON.parse(await readFile('data.json')));
export async function save() {
  await writeFile('data.json', Buffer.from(JSON.stringify(data)));
}

export function parse(schema, req, res) {
  const { success, data, error } = schema.safeParse(req.body);
  if (success) return data;
  res.status(400).end(error.issues[0].message);
}

const envSchema = z.object({
  AUTH_SECRET: z.string()
})

const { parsed, error } = config()
if (!parsed) throw new Error("Loading config failed", { cause: error })

export const env = envSchema.parse(parsed)