import {
    IBulkChange,
    IChange,
    IObservableCollection,
    IObserver
} from "./interfaces";
import { injectable } from "inversify";
/**
 * The ObservableCollection class implements an observable collection
 * that allows adding and removing observers, as well as notifying them
 * of changes.
 *
 * @template T The type of items that this collection holds.
 */
@injectable()
export class ObservableCollection<T> implements IObservableCollection<T> {
    private items: T[] = [];
    private observers: IObserver<T>[] = [];

    /**
     * Adds an observer to the collection.
     *
     * If the observer is already added to the collection, it won't be added again.
     *
     * @param {IObserver<T>} observer - The observer to be added.
     * @returns {boolean} Returns true if the observer is successfully added; otherwise, if the observer is already in the collection, returns false.
     */
    addObserver(observer: IObserver<T>): boolean {
        if (this.observers.includes(observer)) {
            return false; // Observer already exists, so don't add again
        }
        this.observers.push(observer);
        return true;
    }
    /**
     * Removes an observer from the collection.
     *
     * @param {IObserver<T>} observer - The observer to be removed.
     * @returns {boolean} Returns true if the observer is found and removed; otherwise, false.
     */
    removeObserver(observer: IObserver<T>): boolean {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Adds an item to the collection and notifies the observers of the addition.
     *
     * @param {T} item - The item to be added to the collection.
     */
    addItem(item: T): void {
        this.items.push(item);
        this.notifyObservers({ type: "add", item });
    }
    /**
     * Adds multiple items to the collection and notifies the observers of the bulk addition.
     *
     * Observers are notified once, irrespective of the number of items added.
     *
     * @param {T[]} items - An array of items to be added to the collection.
     */
    addItems(items: T[]): void {
        this.items.push(...items);
        this.notifyObservers({ type: "bulk-add", items: items }); // Pass items
    }
    /**
     * Finds an item in the collection that satisfies the provided function.
     *
     * @param {(item: T) => boolean} conditionFunc - The function that new items must satisfy.
     * @returns {T | undefined} The first item in the collection that satisfies the provided function; otherwise, undefined.
     */
    findItem(conditionFunc: (item: T) => boolean): T | undefined {
        return this.items.find(conditionFunc);
    }
    /**
     * Removes an item from the collection and notifies the observers of the removal.
     *
     * @param {T} item - The item to be removed from the collection.
     */
    removeItem(item: T): void {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            this.notifyObservers({ type: "remove", item });
        }
    }
    /**
     * Removes multiple items from the collection and notifies the observers of the bulk removal.
     *
     * This method leverages the Set data structure to efficiently identify and remove items from the collection.
     * Observers are notified once, irrespective of the number of items removed.
     * If an item is not found in the collection, it is simply ignored.
     *
     * @param {T[]} itemsToRemove - An array of items to be removed from the collection.
     */
    removeItems(itemsToRemove: T[]): void {
        const itemsToRemoveSet = new Set(itemsToRemove);
        this.items = this.items.filter((item) => !itemsToRemoveSet.has(item));
        this.notifyObservers({ type: "bulk-remove", items: itemsToRemove });
    }
    /**
     * Notifies all the observers about a change in the collection.
     *
     * This method accepts changes that can either be of type `IChange` (a single item change)
     * or `IBulkChange` (multiple items change). Depending on the type of change, appropriate
     * logs are printed to the console.
     *
     * @private
     * @param {IChange<T> | IBulkChange<T>} change - The change that occurred in the collection.
     */
    private notifyObservers(change: IChange<T> | IBulkChange<T>): void {
        for (const observer of this.observers) {
            observer.notify(change as IChange<T>); // Here, we're casting it to 'any' to satisfy the type system.
        }
        if ("item" in change) {
            // This block handles IChange
        } else if ("items" in change) {
            // This block handles IBulkChange
        }
    }
    /**
     * Retrieves a copy of all items in the collection.
     *
     * @returns {T[]} An array containing all items currently in the collection.
     */
    getItems(): T[] {
        return [...this.items];
    }
}
