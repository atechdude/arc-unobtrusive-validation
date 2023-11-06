import { Container } from "inversify";
import { TYPES } from "./container-types";
import {
    IAppEvents,
    IDebouncerFactory,
    IDebouncerManager,
    IDecoratedLogger,
    IEventEmitter,
    IEventService,
    IForm,
    IFormFactory,
    IFormManager,
    IFormObserver,
    IInitializer,
    ILoggerService,
    IObservableCollection,
    IStateManager,
    IValidationService

}
    from "../interfaces";
import { DebuggingLogger } from "../logger/debuggingLogger";
import { LoggerService } from "../services/loggerService";
import { Initializer } from "../Initializer";
import { EventEmitter } from "../EventEmitter";
import { FormFactory } from "../FormFactory";

import { ObservableCollection } from "../ObservableCollection";
import { DebouncerFactory } from "../DebouncerFactory";
import { FormManager } from "../FormManager";

import { EventService } from "../services/EventService";
import { StateManager } from "../StateManager";
import { DebouncerManager } from "../DebounceManager";
import { ValidationService } from "../services/ValidationService";
import { FormObserver } from "../FormObserver";







const container = new Container();

container.bind<ILoggerService>(TYPES.Logger).to(LoggerService).inSingletonScope();
container.bind<IEventEmitter<IAppEvents>>(TYPES.EventEmitter).to(EventEmitter<IAppEvents>).inRequestScope();
container.bind<IEventService>(TYPES.EventService).to(EventService).inSingletonScope;
container.bind<IStateManager>(TYPES.StateManager).to(StateManager).inSingletonScope();
container.bind<IDecoratedLogger>(TYPES.DebuggingLogger).to(DebuggingLogger).inRequestScope();
container.bind<IInitializer>(TYPES.Initializer).to(Initializer).inSingletonScope();
container.bind<IFormManager>(TYPES.FormManager).to(FormManager).inSingletonScope();
container.bind<IFormObserver>(TYPES.FormObserver).to(FormObserver).inSingletonScope();
container.bind<IFormFactory>(TYPES.FormFactory).to(FormFactory).inSingletonScope();

container.bind<IObservableCollection<IForm>>(TYPES.ObservableFormsCollection).to(ObservableCollection<IForm>).inSingletonScope();
container.bind<IDebouncerManager>(TYPES.DebouncerManager).to(DebouncerManager).inSingletonScope();
container.bind<IDebouncerFactory>(TYPES.DebouncerFactory).to(DebouncerFactory).inSingletonScope();
container.bind<IValidationService>(TYPES.ValidationService).to(ValidationService).inSingletonScope();




export { container };
