export interface IStateManager {
    makeControlDirty(controlName: string): void;
    isControlDirty(controlName: string): boolean;
    clearControlDirtyState(controlName: string): void;
    clearControlsDirtyState(controlNames: string[]): void;
    setControlValidated(controlName: string): void;
    isControlValidated(controlName: string): boolean;
    clearControlValidatedState(controlName: string): void;
    clearControlsValidatedState(controlNames: string[]): void;
    setInitialValue(controlName: string, value: string): void;
    hasValueChanged(controlName: string, currentValue: string): boolean;
}
