export interface IFormManager {
    init(): Promise<void>;
    createForms(): void;
    handleFormMutations(mutationsList: MutationRecord[]): void;
}
