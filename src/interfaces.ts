import log from "loglevel";
import { Result } from "./Result";
import { RuleConstructor } from "./Types";
import { Debouncer } from "./util/Debouncer";

export interface IOptions {
    debug: boolean;
    logLevel: string;
    customRules?: IValidationRule[];
    [key: string]: any;
    autoInit?: boolean;
}


export interface ILoggerService extends log.Logger {

}
export interface IDecoratedLogger {
    getLogger: () => ILoggerService
}
export interface IInitializer {
    init(): Promise<void>
}


export interface IEventEmitter<TEvents> {
    on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void;
    off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void;
    emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
}

export interface IEventMap<T> {
    [event: string]: IEventData<T>;
}
export interface IEventData<T> {
    timestamp: Date;
    source?: string;
    data: T;
}

export interface IAppEvents {
    Initialized: {
        source: string
        message: string;
    };
    FormSubmitted: {
        form: IForm
    };
}
export interface IFormManager {
    init(): Promise<void>;
    createForms(): void;
    setupForms(forms: IForm[]): Promise<void>;
    configureListeners(form: IForm): Promise<void>;
    removeListeners(formElement:HTMLFormElement): Promise<void>;
}
export interface IForm {
    formElement: HTMLFormElement;
    isAjax: boolean;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    element: Element;
    buttons: HTMLButtonElement[];
    init(): void
}

export interface IFormResult {
    form: IForm | undefined
    status: string
    errorMessage: string
}

export interface IFormFactory {
    create(formElement: HTMLFormElement): Result<IForm>
}

// New Validation Interfaces
export interface IValidationRule {
    type: string;
    message: string;
    priority: number;
}
export interface IValidator {
    canHandle(rule: IValidationRule): boolean;
    validate(value: string, rule: IValidationRule): boolean;
}

export interface IValidationService {
    init(validators: IValidator[]): void; // Initialization can now take an array of validators.
    validateForm(form: IForm): void; // Validation of the entire form.
    validateControl(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): Promise<void>; // Individual control validation.
}

export interface IValidationResult {
    control: HTMLInputElement
    isValid: boolean
    errorMessage: string
}

export interface IRuleFactory {
    registerRuleConstructor(type: string, constructor: RuleConstructor): void;
    createRule(rule:IValidationRule): IValidationRule;
}

export interface IRuleService {
    registerRule(rule:IValidationRule): void;
    getSortedRules(): IValidationRule[];
}
export interface IValidationRuleRegistry {
    validationAttribute: string;
    addRule(rule: IValidationRule): void;
    getRulesForControl(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): IValidationRule[];
    setValidationAttribute(attribute: string): void;
}

// State Management Interfaces
export interface IStateManager {
    makeControlDirty(controlName: string): void;
    isControlDirty(controlName: string): boolean;
    clearControlDirtyState(controlName: string): void;
    clearControlsDirtyState(controlNames: string[]): void
}
// Debouncer Interfaces
export interface IDebouncerFactory {
    create(): IDebouncer;
}
export interface IDebouncer {
    debounce<T extends (...args: any[]) => void>(func: T, waitMilliseconds: number): void;
    cancel(): void
}
export interface IDebouncerManager {
    getDebouncerForControl(controlName: string): Debouncer;
    clearDebouncersForControl(controlName: string): void;
    clearDebouncersForControls(controlNames: string[]): void
}

/**
 * Represents a generic collection object that allows observers to be
 * added and removed, and provides notifications to its observers
 * when changes are made to the collection.
 *
 * @template T The type of items that this collection holds.
 */
export interface IObservableCollection<T> {
    /**
      * Adds an observer to the collection.
      *
      * @param {IObserver<T>} observer - The observer to be added.
      * @returns {boolean} Returns true if the observer is successfully added.
      */
    addObserver: (observer: IObserver<T>) => boolean
    /**
       * Removes an observer from the collection.
       *
       * @param {IObserver<T>} observer - The observer to be removed.
       * @returns {boolean} Returns true if the observer is found and removed; otherwise, false.
       */
    removeObserver: (observer: IObserver<T>) => boolean
    /**
       * Adds an item to the collection.
       *
       * @param {T} item - The item to be added to the collection.
       */
    addItem: (item: T) => void
    /**
      * Adds multiple items to the collection.
      *
      * @param {T[]} items - An array of items to be added to the collection.
      */
    addItems: (items: T[]) => void
    /**
      * Finds an item in the collection that satisfies the provided function.
      *
      * @param {(item: T) => boolean} conditionFunc - The function that new items must satisfy.
      * @returns {T | undefined} The first item in the collection that satisfies the provided function; otherwise, undefined.
      */
    findItem: (conditionFunc: (item: T) => boolean) => T | undefined
    /**
       * Removes an item from the collection.
       *
       * @param {T} item - The item to be removed from the collection.
       */
    removeItem: (item: T) => void
    /**
      * Removes multiple items from the collection.
      *
      * @param {T[]} itemsToRemove - An array of items to be removed from the collection.
      */
    removeItems: (itemsToRemove: T[]) => void
    /**
       * Retrieves all items from the collection.
       *
       * @returns {T[]} An array containing all items in the collection.
       */
    getItems: () => T[]
}

// Observable Collection Interfaces
/**
 * Represents a change occurring in an ObservableCollection.
 *
 * This interface is utilized to notify observers about changes
 * in the ObservableCollection, primarily about additions and removals.
 *
 * @template T The type of item being added or removed.
 */
export interface IChange<T> {
    /**
       * Represents the type of change that occurred.
       *
       * @type {'add' | 'remove'}
       */
    type: "add" | "remove"
    /**
      * The item that was added or removed.
      *
      * @type {T}
      */
    item: T
}

/**
* Represents a bulk change (either addition or removal) in the collection.
*
* @template T The type of items affected by the bulk change.
* @property {('bulk-add' | 'bulk-remove')} type - The type of bulk operation. It can either be 'bulk-add' for additions or 'bulk-remove' for removals.
* @property {T[]} items - An array of items that are either added or removed from the collection during the bulk operation.
*/
export interface IBulkChange<T> {
    type: "bulk-add" | "bulk-remove"
    items: T[]
}

/**
 * Represents an observer in the Observer Pattern.
 *
 * This observer is notified of all changes in the observed subject.
 *
 * @template T The type of the item within the change object.
 */
export interface IObserver<T> {
    /**
      * Notified when there is a change in the observed subject.
      *
      * @param {IChange<T>} change - The change object containing the type of change and the item involved.
      */
    // notify: (change: IChange<T>) => void
    notify: (change: IChange<T>) => void
}


