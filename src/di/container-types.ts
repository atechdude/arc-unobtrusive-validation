const TYPES = {
    Options: Symbol.for("IOptions"),
    Logger: Symbol.for("ILoggerService"),
    EventEmitter: Symbol.for("IEventEmitter"),
    DebuggingLogger: Symbol.for("IDecoratedLogger"),
    Initializer: Symbol.for("IInitializer"),
    DebouncerFactory: Symbol.for("IDebouncerFactory"),
    FormManager: Symbol.for("IFormManager"),
    FormFactory: Symbol.for("IFormFactory"),
    ObservableFormsCollection: Symbol.for("IObservableCollection"),
    ValidationService: Symbol.for("IValidationService"),
    ValidationRuleRegistry: Symbol.for("IValidationRuleRegistry"),
    RuleFactory: Symbol.for("IRuleFactory"),
    RuleService: Symbol.for("IRuleService")

};
export { TYPES };
