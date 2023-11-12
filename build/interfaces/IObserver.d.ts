import { IChange } from "./IChange";
/**
 * Represents an observer in the Observer Pattern.
 *
 * This observer is notified of all changes in the observed subject.
 * @template T The type of the item within the change object.
 */
export interface IObserver<T> {
    /**
     * Notified when there is a change in the observed subject.
     * @param {IChange<T>} change - The change object containing the type of change and the item involved.
     */
    notify: (change: IChange<T>) => void;
}
