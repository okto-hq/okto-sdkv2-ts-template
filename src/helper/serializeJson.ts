/*
 * Serializes an object to JSON, handling BigInt values properly
*/
export function serializeJSON(obj: any, space: any = null) {
    return JSON.stringify(
        obj,
        (key, value) =>
            typeof value === "bigint" ? value.toString() + "n" : value,
        space
    );
}
