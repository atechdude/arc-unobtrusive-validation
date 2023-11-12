import { Result } from "../classes/Result";
import { IForm } from "./IForm";
export interface IFormFactory {
    create(formElement: HTMLFormElement): Result<IForm>;
}
