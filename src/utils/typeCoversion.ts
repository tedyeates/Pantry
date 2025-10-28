import type { FirebaseObject } from "@/lib/schemas/schema";

export function convertFirebaseObject<T>(data: T & FirebaseObject) {
    return {
        ...data,
        createdDate: data.createdDate.toDate()
    }
}