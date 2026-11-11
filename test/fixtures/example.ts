import { readFile } from 'node:fs/promises';

interface User { readonly id: number; name: string }
const pattern = /^[a-z]+$/i;
const limit = 42;

function sealed(target: Function): void { Object.seal(target); }
@sealed
class Reader { readonly count = limit; }

// Keep comments readable, including on the active line.
export async function loadUser(id: number): Promise<User> {
  const name = await readFile(`users/${id}.txt`, 'utf8');
  if (!pattern.test(name)) throw new Error('Invalid name');
  return { id, name };
}
