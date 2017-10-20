import TectonicDB from "./tectonic";

export const db = new TectonicDB();

export async function createTableForPair(pair: string) : Promise<boolean> {
  await db.create(pair);
  return true;
}

export async function tableExistsForPair(pair: string) : Promise<boolean> {
  let {success} = await db.use(pair);
  return success;
}
