/**
 * Represents a change occurring in an ObservableCollection.
 *
 * This interface is utilized to notify observers about changes
 * in the ObservableCollection, primarily about additions and removals.
 * @template T The type of item being added or removed.
 */

export interface IChange<T> {
    /**
     * Represents the type of change that occurred.
     * @type {'add' | 'remove'}
     */
    type: "add" | "remove";
    /**
     * The item that was added or removed.
     * @type {T}
     */
    item: T;
}
