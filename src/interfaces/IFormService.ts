import { IForm } from "./IForm";
import { ISubmitHandler } from "./ISubmitHandler";

export interface IFormService {
    addForm(formElement: HTMLFormElement): IForm | undefined;
    checkForm(formElement: HTMLFormElement): IForm | undefined;
    setSubmitHandler(formName: string, handler: ISubmitHandler): void
    getFormByName(formName: string): IForm | undefined
}
