import { ValidationParams } from "../types/CustomTypes";
export interface IValidationRule {
    type: string;
    message: string;
    params: ValidationParams;
    priority: number;
}
