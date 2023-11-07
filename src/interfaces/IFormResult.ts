import { IForm } from "./IForm";
export interface IFormResult {
    form: IForm | undefined;
    status: string;
    errorMessage: string;
}
