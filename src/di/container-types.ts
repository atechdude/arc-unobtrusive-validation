const TYPES = {

    Options: Symbol.for("IOptions"),
    Utils: Symbol.for("IUtil"),
    FormService: Symbol.for("IFormService"),
    Logger: Symbol.for("ILoggerService"),
    EventService: Symbol.for("IEventService"),
    StateManager: Symbol.for("IStateManager"),
    DebouncerManager: Symbol.for("IDebouncerManager"),
    EventEmitter: Symbol.for("IEventEmitter"),
    DebuggingLogger: Symbol.for("IDecoratedLogger"),
    Initializer: Symbol.for("IInitializer"),
    DebouncerFactory: Symbol.for("IDebouncerFactory"),
    Form: Symbol.for("IForm"),
    FormManager: Symbol.for("IFormManager"),
    FormFactory: Symbol.for("IFormFactory"),
    FormParser: Symbol.for("IFormParser"),
    ObservableFormsCollection: Symbol.for("IObservableCollection"),
    ValidationService: Symbol.for("IValidationService"),
    ValidationControlFactory: Symbol.for("IValidationControlFactory"),
    UIHandler: Symbol.for("IUIHandler")
};
export { TYPES };
