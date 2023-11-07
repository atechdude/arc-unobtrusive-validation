import { IForm } from "./IForm";
import { IChange } from "./IChange";
import { IDebouncer } from "./IDebouncer";
export interface IEventService {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>>;
    dirtyMap: { [key: string]: boolean };
    debouncers: { [key: string]: IDebouncer };
    notify(change: IChange<IForm>): Promise<void>;
    setupHandlers(form: IForm): void;
    createInputHandler(debounceTime: number): EventListener;
    createBlurHandler(): EventListener;
    focusEventHandler(event: Event): void;
    debouncedValidate(
        input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        debounceTime: number
    ): void;
    cleanupResourcesForForm(formElement: HTMLFormElement): Promise<void>;
}
