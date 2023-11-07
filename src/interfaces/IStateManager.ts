export interface IStateManager {
    makeControlDirty(controlName: string): void;
    isControlDirty(controlName: string): boolean;
    clearControlDirtyState(controlName: string): void;
    clearControlsDirtyState(controlNames: string[]): void;
}
