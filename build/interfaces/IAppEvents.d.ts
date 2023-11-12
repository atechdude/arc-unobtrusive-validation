import { IForm } from "./IForm";
export interface IAppEvents {
    Initialized: {
        source: string;
        message: string;
    };
    FormSubmitted: {
        form: IForm;
    };
}
