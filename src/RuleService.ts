import { inject, injectable } from "inversify";
import { TYPES } from "./di/container-types";
import { IRuleFactory, IRuleService, IValidationRule, IValidationRuleRegistry } from "src/interfaces";
@injectable()
export class RuleService implements IRuleService {



    constructor(
        @inject(TYPES.ValidationRuleRegistry) private readonly _validationRuleRegistry:IValidationRuleRegistry,
        @inject(TYPES.RuleFactory) private readonly _ruleFactory:IRuleFactory) {}

    public registerRule(rule: IValidationRule): void {
        console.log("Registering rule");
        // Here you would have some logic to add the rule to the registry.
        // Assuming _validationRuleRegistry has an addRule method:
        this._validationRuleRegistry.addRule(rule);
    }

    public getSortedRules(): IValidationRule[] {
        // Assuming getRules returns the rules sorted already,
        // otherwise you will need to sort them before returning.
        return this._validationRuleRegistry.getRules();
    }


}



