import { IForm } from "./IForm";
export interface IFormManager {
    init(): void;
    createForms(): void;
    handleFormMutations(mutationsList: MutationRecord[]): void;
    getFormByName(formName: string): IForm | undefined;
}
