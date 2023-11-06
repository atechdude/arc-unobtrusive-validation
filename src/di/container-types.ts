const TYPES = {
    Options: Symbol.for("IOptions"),
    Logger: Symbol.for("ILoggerService"),
    EventService: Symbol.for("IEventService"),
    StateManager: Symbol.for("IStateManager"),
    DebouncerManager: Symbol.for("IDebouncerManager"),
    EventEmitter: Symbol.for("IEventEmitter"),
    DebuggingLogger: Symbol.for("IDecoratedLogger"),
    Initializer: Symbol.for("IInitializer"),
    DebouncerFactory: Symbol.for("IDebouncerFactory"),
    FormManager: Symbol.for("IFormManager"),
    FormObserver: Symbol.for("IFormObserver"),
    FormFactory: Symbol.for("IFormFactory"),
    ObservableFormsCollection: Symbol.for("IObservableCollection"),
    ValidationService: Symbol.for("IValidationService")
};
export { TYPES };
