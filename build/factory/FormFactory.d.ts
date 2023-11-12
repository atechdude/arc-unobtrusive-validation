import { IForm, IFormFactory } from "../interfaces";
import { Result } from "../classes/Result";
export declare class FormFactory implements IFormFactory {
    constructor();
    create(formElement: HTMLFormElement): Result<IForm>;
}
