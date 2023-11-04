import { IValidationRule } from "./interfaces";

export type RuleConstructor = new (attributes: any, message?: string) => IValidationRule;


