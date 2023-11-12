export interface ISubmitHandler {
    (formElement: HTMLFormElement, isValid: boolean): void | Promise<void>;
}
