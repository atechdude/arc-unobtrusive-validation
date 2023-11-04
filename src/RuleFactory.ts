import { injectable } from "inversify";
import { RuleConstructor } from "./Types";
import { IRuleFactory, IValidationRule } from "./interfaces";

/* export class RuleFactory implements IRuleFactory {
    ruleConstructors: Map<string, RuleConstructor> = new Map();

    registerRuleConstructor(type: string, constructor: RuleConstructor): void {
        if (this.ruleConstructors.has(type)) {
            throw new Error(`A rule constructor for type '${type}' is already registered.`);
        }
        this.ruleConstructors.set(type, constructor);
    }

    createRule(rule: IValidationRule): IValidationRule {
        if (!rule.type) {
            throw new Error("The rule does not have a type defined.");
        }

        const constructor = this.ruleConstructors.get(rule.type);
        if (!constructor) {
            throw new Error(`Rule type '${rule.type}' is not recognized.`);
        }

        // We need to ensure that the constructor can handle the `attributes` property properly.
        // This might involve converting `NamedNodeMap` to a suitable format if necessary.
        return new constructor(rule.attribute, rule.message); // Adjust according to how your constructors are set up.
    }
}
 */
@injectable()
export class RuleFactory implements IRuleFactory {
    registerRuleConstructor(type: string, constructor: RuleConstructor): void {
        throw new Error("Method not implemented.");
    }
    createRule(rule: IValidationRule): IValidationRule {
        throw new Error("Method not implemented.");
    }

}
