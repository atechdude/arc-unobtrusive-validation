import { injectable } from "inversify";
import { IEventEmitter } from "./interfaces";



// Define a type that describes the events and the structure of data they pass.


// EventListener now strictly expects data that conforms to the structure described in the EventMap.


@injectable()
export class EventEmitter<TEvents> implements IEventEmitter<TEvents> {
    private listeners: { [K in keyof TEvents]?: ((data: TEvents[K]) => void)[] } = {};

    on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
    }

    off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
        if (!this.listeners[event]) return;
        const callbackIndex = this.listeners[event]!.indexOf(listener);
        if (callbackIndex >= 0) this.listeners[event]!.splice(callbackIndex, 1);
    }

    emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
        if (!this.listeners[event]) return;
        for (const listener of this.listeners[event]!) {
            listener(data);
        }
    }
}

