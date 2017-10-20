import TectonicDB from "./tectonic";

export const db = new TectonicDB();

export async function createTableForPair(pair: string) : Promise<boolean> {
  console.log("FUCK1")
  await db.create(pair);
  console.log("FUCK2")
  return true;
}

export async function tableExistsForPair(pair: string) : Promise<boolean> {
  let {success} = await db.use(pair);
  return success;
}
