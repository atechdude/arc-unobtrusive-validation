import { injectable } from "inversify";
import { IForm, IFormFactory } from "./interfaces";
import { Result } from "./Result";
import { Form } from "./Form";


@injectable()
export class FormFactory implements IFormFactory {
    constructor() {
    }
    create(formElement: HTMLFormElement): Result<IForm> {
        try {
            if (formElement === undefined) {
                return new Result<IForm>(new Error("Form Element Is Undefined"));
            }
            const form = new Form(formElement);


            return new Result<IForm>(form);
        } catch (error: unknown) {
            return new Result<IForm>(error as Error);
        }
    }
}
