/**
 * Represents a bulk change (either addition or removal) in the collection.
 * @template T The type of items affected by the bulk change.
 * @property {('bulk-add' | 'bulk-remove')} type - The type of bulk operation. It can either be 'bulk-add' for additions or 'bulk-remove' for removals.
 * @property {T[]} items - An array of items that are either added or removed from the collection during the bulk operation.
 */

export interface IBulkChange<T> {
    type: "bulk-add" | "bulk-remove";
    items: T[];
}
