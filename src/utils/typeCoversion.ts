import type { FirebaseObject, InternalObject } from "@/lib/schemas/schema";

export function convertFirebaseObject<U extends FirebaseObject, T extends InternalObject>(data: U): T {
    return {
        ...data,
        createdDate: data.createdDate.toDate()
    } as unknown as T;
}