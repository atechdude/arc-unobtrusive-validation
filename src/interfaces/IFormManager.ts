export interface IFormManager {
    init(): void;
    createForms(): void;
    handleFormMutations(mutationsList: MutationRecord[]): void;
}
