import { IFormManager } from "./IFormManager";
import { ISubmitHandler } from "./ISubmitHandler";
export interface IInitializer {
    init(): Promise<IFormManager>;
    setSubmitHandler(formName: string, handler: ISubmitHandler): Promise<void>;
}
