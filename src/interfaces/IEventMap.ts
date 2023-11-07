import { IEventData } from "./IEventData";
export interface IEventMap<T> {
    [event: string]: IEventData<T>;
}
