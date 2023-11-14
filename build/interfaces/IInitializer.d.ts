import { ISubmitHandler } from "./ISubmitHandler";
export interface IInitializer {
    init(): Promise<void>;
    setSubmitHandler(formName: string, handler: ISubmitHandler): Promise<void>;
}
