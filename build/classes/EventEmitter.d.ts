import { IEventEmitter } from "../interfaces";
export declare class EventEmitter<TEvents> implements IEventEmitter<TEvents> {
    private listeners;
    constructor();
    on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void;
    off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void;
    emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
}
