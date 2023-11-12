import { IObserver } from "./IObserver";
/**
 * Represents a generic collection object that allows observers to be
 * added and removed, and provides notifications to its observers
 * when changes are made to the collection.
 * @template T The type of items that this collection holds.
 */
export interface IObservableCollection<T> {
    /**
     * Adds an observer to the collection.
     * @param {IObserver<T>} observer - The observer to be added.
     * @returns {boolean} Returns true if the observer is successfully added.
     */
    addObserver: (observer: IObserver<T>) => boolean;
    /**
     * Removes an observer from the collection.
     * @param {IObserver<T>} observer - The observer to be removed.
     * @returns {boolean} Returns true if the observer is found and removed; otherwise, false.
     */
    removeObserver: (observer: IObserver<T>) => boolean;
    /**
     * Adds an item to the collection.
     * @param {T} item - The item to be added to the collection.
     */
    addItem: (item: T) => void;
    /**
     * Adds multiple items to the collection.
     * @param {T[]} items - An array of items to be added to the collection.
     */
    addItems: (items: T[]) => void;
    /**
     * Finds an item in the collection that satisfies the provided function.
     * @param {(item: T) => boolean} conditionFunc - The function that new items must satisfy.
     * @returns {T | undefined} The first item in the collection that satisfies the provided function; otherwise, undefined.
     */
    findItem: (conditionFunc: (item: T) => boolean) => T | undefined;
    /**
     * Removes an item from the collection.
     * @param {T} item - The item to be removed from the collection.
     */
    removeItem: (item: T) => void;
    /**
     * Removes multiple items from the collection.
     * @param {T[]} itemsToRemove - An array of items to be removed from the collection.
     */
    removeItems: (itemsToRemove: T[]) => void;
    /**
     * Retrieves all items from the collection.
     * @returns {T[]} An array containing all items in the collection.
     */
    getItems: () => T[];
}
