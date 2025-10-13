import type { HnItem, ResultFetch } from "./types";
import { safeFetch, wait } from "./utils";

const hnBaseUrl = "https://hacker-news.firebaseio.com/v0"
export async function hnGetItem(id: number): Promise<ResultFetch<HnItem>> {
    const result = await safeFetch<HnItem>(
        fetch(`${hnBaseUrl}/item/${id}.json`)
    )

    return result;
}
export async function hnGetTopStories(): Promise<ResultFetch<number[]>> {
    const result = await safeFetch<number[]>(
        fetch(`${hnBaseUrl}/topstories.json`)
    )
    console.log("top result", result)
    if (result.type === 'SUCCESS') {
        if (!Array.isArray(result.data)) {
            return {
                type: "FAILURE",
                error: "NOT ARRAY"
            }
        }
    }

    return result;
}
export async function hnGetBestStories(): Promise<ResultFetch<number[]>> {
    const result = await safeFetch<number[]>(
        fetch(`${hnBaseUrl}/beststories.json`)
    )
    if (result.type === 'SUCCESS') {
        if (!Array.isArray(result.data)) {
            return {
                type: "FAILURE",
                error: "NOT ARRAY"
            }
        }
    }

    return result;
}
export async function hnGetNewStories(): Promise<ResultFetch<number[]>> {
    const result = await safeFetch<number[]>(
        fetch(`${hnBaseUrl}/newstories.json`)
    )
    if (result.type === 'SUCCESS') {
        if (!Array.isArray(result.data)) {
            return {
                type: "FAILURE",
                error: "NOT ARRAY"
            }
        }
    }

    return result;
}


export async function* hnGetBulkItems(ids: number[]): AsyncGenerator<ResultFetch<HnItem>> {
    const MAX_PROMISES = 5;
    let promisePool: Promise<ResultFetch<HnItem>>[] = []

    while (ids.length > 0 || promisePool.length > 0) {
        while (promisePool.length < MAX_PROMISES && ids.length > 0) {
            const id = ids.pop()
            if (!id) {
                break
            }
            console.log(id);

            // todo: check if correct order
            const p = hnGetItem(id).then((res) => {
                promisePool.splice(promisePool.indexOf(p), 1)
                return res
            })

            promisePool.push(p);
        }

        if (promisePool.length === 0) {
            break;
        }

        const result = await Promise.race(promisePool);

        yield result;
    }

    return;
}