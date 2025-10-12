import { getContext, setContext } from "svelte";
import type { HnItem, ResultFetch } from "../types";


const Errors = Object.freeze({
  NO_DB: "No database",
  TRANSACTION_FAILED: "Transaction failed",
});

export class StoryRepository {
  db: IDBDatabase | undefined = $state();
  static dbName = "stories"
  static migrate(db: IDBDatabase) {
    if (!db.objectStoreNames.contains(this.dbName)) {
      const store = db.createObjectStore(this.dbName, {
        keyPath: "id",
      });
      store.createIndex("id", "id", { unique: true });
      store.createIndex("title", "title", { unique: false });
    }
  }

  async create(story: HnItem): Promise<ResultFetch<undefined>> {
    if (!this.db)
      return {
        type: "FAILURE",
        error: Errors.NO_DB,
      };

    const transaction = this.db.transaction(StoryRepository.dbName, "readwrite");
    const store = transaction.objectStore(StoryRepository.dbName);
    const req = store.add(story);

    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        resolve({
          type: "SUCCESS",
          data: undefined
        });
      };
      req.onerror = (e) => {
        console.log(e);
        resolve({ type: "FAILURE", error: Errors.TRANSACTION_FAILED });
      };
    });
  }
  async get(id: number): Promise<ResultFetch<HnItem | undefined>> {
    if (!this.db)
      return {
        type: "FAILURE",
        error: Errors.NO_DB,
      };
    const transaction = this.db.transaction(StoryRepository.dbName, "readonly");
    const store = transaction.objectStore(StoryRepository.dbName);
    const req = store.get(id);

    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        resolve(req.result);
      };
      req.onerror = () => {
        resolve({
          type: "FAILURE",
          error: Errors.TRANSACTION_FAILED,
        });
      };
    });
  }
  async getMany(ids: number[]): Promise<ResultFetch<Record<number, HnItem | undefined>>> {
    if (!this.db) {
      return {
        type: "FAILURE",
        error: Errors.NO_DB,
      };
    }

    const transaction = this.db.transaction(StoryRepository.dbName, "readonly");
    const store = transaction.objectStore(StoryRepository.dbName);
    const results: Record<number, HnItem | undefined> = {};
    ids.forEach((id) => {
      results[id] = undefined;
    })

    const requests: IDBRequest[] = [];

    for (const id of ids) {
      requests.push(store.get(id));
    }

    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        for (const req of requests) {
          if (req.result) {
            results[req.result.id] = req.result
          }
        }

        resolve({
          type: "SUCCESS",
          data: results,
        });
      };

      transaction.onerror = () => {
        resolve({
          type: "FAILURE",
          error: Errors.TRANSACTION_FAILED,
        });
      };
    });
  }
}