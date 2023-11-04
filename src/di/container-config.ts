import { Container } from "inversify";
import { TYPES } from "./container-types";
import { IAppEvents, IDebouncerFactory, IDecoratedLogger, IEventEmitter, IForm, IFormFactory, IFormManager, IInitializer, ILoggerService, IObservableCollection, IRuleFactory, IRuleService, IValidationRuleRegistry } from "../interfaces";
import { DebuggingLogger } from "../logger/debuggingLogger";
import { LoggerService } from "../services/loggerService";
import { Initializer } from "../Initializer";
import { EventEmitter } from "../EventEmitter";
import { FormFactory } from "../FormFactory";
import { ValidationService } from "../services/ValidationService";
import { ObservableCollection } from "../ObservableCollection";
import { DebouncerFactory } from "../DebouncerFactory";
import { FormManager } from "../FormManager";
import { ValidationRuleRegistry } from "../ValidationRuleRegistry";
import { RuleFactory } from "../RuleFactory";
import { RuleService } from "../RuleService";





const container = new Container();

container.bind<ILoggerService>(TYPES.Logger).to(LoggerService).inRequestScope();
container.bind<IEventEmitter<IAppEvents>>(TYPES.EventEmitter).to(EventEmitter<IAppEvents>).inRequestScope();
container.bind<IDecoratedLogger>(TYPES.DebuggingLogger).to(DebuggingLogger).inRequestScope();
container.bind<IInitializer>(TYPES.Initializer).to(Initializer).inSingletonScope();
container.bind<IFormManager>(TYPES.FormManager).to(FormManager).inSingletonScope();
container.bind<IFormFactory>(TYPES.FormFactory).to(FormFactory).inSingletonScope();
container.bind<ValidationService>(TYPES.ValidationService).to(ValidationService).inSingletonScope();
container.bind<IObservableCollection<IForm>>(TYPES.ObservableFormsCollection).to(ObservableCollection<IForm>).inSingletonScope();
container.bind<IDebouncerFactory>(TYPES.DebouncerFactory).to(DebouncerFactory).inSingletonScope();
container.bind<IRuleFactory>(TYPES.RuleFactory).to(RuleFactory).inSingletonScope();

container.bind<IRuleService>(TYPES.RuleService).to(RuleService).inSingletonScope();
container.bind<IValidationRuleRegistry>(TYPES.ValidationRuleRegistry).to(ValidationRuleRegistry).inSingletonScope();
export { container };
