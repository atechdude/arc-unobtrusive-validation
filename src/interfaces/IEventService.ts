import { IForm } from "./IForm";
import { IChange } from "./IChange";
import { IDebouncer } from "./IDebouncer";
import { ISubmitHandler } from "./ISubmitHandler";
export interface IEventService {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>>;
    dirtyMap: { [key: string]: boolean };
    debouncers: { [key: string]: IDebouncer };
    notify(change: IChange<IForm>): Promise<void>;
    setupHandlers(form: IForm): void;
    createInputHandler(debounceTime: number): EventListener;
    createBlurHandler(): EventListener;
    createFocusHandler(): EventListener;
    debouncedValidate(
        control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        debounceTime: number,
        validateControl: () => Promise<void>
    ): void;
    setSubmitHandler(formName: string, handler: ISubmitHandler): void;
    queueSubmitHandler(formName: string, handler: ISubmitHandler): void;
    clearSubmitHandler(formName: string): void;
    cleanupResourcesForForm(formElement: HTMLFormElement): Promise<void>;
}
