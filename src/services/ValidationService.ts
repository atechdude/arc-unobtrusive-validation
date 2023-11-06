import { inject, injectable } from "inversify";
import { Result } from "../Result";
import { TYPES } from "../di/container-types";
import { IForm, IObservableCollection, IValidationResult, IValidationService } from "../interfaces";

@injectable()
export class ValidationService implements IValidationService {
    constructor(@inject(TYPES.ObservableFormsCollection) private readonly _observableFormsCollection:IObservableCollection<IForm>){}

    validateControl(control: HTMLInputElement): Promise<Result<IValidationResult>> {
        throw new Error("Method not implemented.");
    }

}





