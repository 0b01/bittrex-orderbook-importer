import {TectonicPool} from './tectonicdb';

export const db = new TectonicPool(100);

export async function createTableForPair(pair: string) : Promise<boolean> {
  return db.create(pair)
  .then(() => {
    return true;
  });
}

export function tableExistsForPair(pair: string) : Promise<boolean> {
  return db.use(pair)
  .then((resp) => {
    return resp.success;
  });
}
