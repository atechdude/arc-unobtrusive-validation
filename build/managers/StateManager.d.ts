import { IDecoratedLogger, IStateManager } from "../interfaces";
export declare class StateManager implements IStateManager {
    private readonly _logger;
    private dirtyMap;
    private validatedMap;
    private interactedMap;
    private initialValues;
    /**
     * Constructs a new instance of the StateManager.
     * @param {IDecoratedLogger} _logger - The logger service for logging information.
     */
    constructor(_logger: IDecoratedLogger);
    /**
     * Marks a control as dirty (modified).
     * @param {string} controlName - The name of the control to mark as dirty.
     */
    makeControlDirty(controlName: string): void;
    /**
     * Checks if a control is marked as dirty (modified).
     * @param {string} controlName - The name of the control to check.
     * @returns {boolean} - True if the control is dirty, otherwise false.
     */
    isControlDirty(controlName: string): boolean;
    /**
     * Clears the dirty state of a control, marking it as clean (unmodified).
     * @param {string} controlName - The name of the control to clear the dirty state for.
     */
    clearControlDirtyState(controlName: string): void;
    /**
     * Clears the dirty state for multiple controls at once.
     * @param {string[]} controlNames - An array of control names to clear the dirty state for.
     */
    clearControlsDirtyState(controlNames: string[]): void;
    /**
     * Marks a control as having passed validation.
     * @param {string} controlName - The name of the control to mark as validated.
     */
    setControlValidated(controlName: string): void;
    /**
     * Checks if a control has passed validation.
     * @param {string} controlName - The name of the control to check.
     * @returns {boolean} - True if the control has been validated, otherwise false.
     */
    isControlValidated(controlName: string): boolean;
    /**
     * Clears the validated state of a control, indicating that it should be validated again.
     * @param {string} controlName - The name of the control to clear the validated state for.
     */
    clearControlValidatedState(controlName: string): void;
    /**
     * Clears the validated state for multiple controls at once.
     * @param {string[]} controlNames - An array of control names to clear the validated state for.
     */
    clearControlsValidatedState(controlNames: string[]): void;
    setInitialValue(controlName: string, value: string): void;
    hasValueChanged(controlName: string, currentValue: string): boolean;
    /**
     * Checks if an initial value has been set for a control.
     * @param {string} controlName - The name of the control to check.
     * @returns {boolean} - True if an initial value has been set, otherwise false.
     */
    hasInitialValue(controlName: string): boolean;
    /**
     * Marks a control as interacted with by the user.
     * @param {string} controlName - The name of the control to mark as interacted.
     */
    makeControlInteracted(controlName: string): void;
    /**
     * Checks if a control has been interacted with by the user.
     * @param {string} controlName - The name of the control to check.
     * @returns {boolean} - True if the control has been interacted with, otherwise false.
     */
    isControlInteracted(controlName: string): boolean;
    /**
     * Clears the interacted state of a control.
     * @param {string} controlName - The name of the control to clear the interacted state for.
     */
    clearControlInteractedState(controlName: string): void;
    /**
     * Clears the interacted state for multiple controls at once.
     * @param {string[]} controlNames - An array of control names to clear the interacted state for.
     */
    clearControlsInteractedState(controlNames: string[]): void;
}
