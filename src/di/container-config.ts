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
    IFormParser,
    IInitializer,
    ILogger,
    IObservableCollection,
    IStateManager,
    IValidationService
} from "@interfaces/index";
import { Logger } from "../logging/Logger";
import { EventEmitter } from "../classes/EventEmitter";
import { EventService } from "../services/EventService";
import { StateManager } from "../managers/StateManager";
import { DebuggingLogger } from "../logging/DebuggingLogger";
import { FormManager } from "../managers/FormManager";
import { Initializer } from "../classes/Initializer";
import { FormParser } from "../classes/FormParser";
import { FormObserver } from "../classes/FormObserver";
import { FormFactory } from "../factory/FormFactory";
import { ObservableCollection } from "../classes/ObservableCollection";
import { DebouncerManager } from "../managers/DebounceManager";
import { DebouncerFactory } from "../factory/DebouncerFactory";
import { ValidationService } from "../services/ValidationService";

const container = new Container();

container.bind<ILogger>(TYPES.Logger).to(Logger).inSingletonScope();
container
    .bind<IEventEmitter<IAppEvents>>(TYPES.EventEmitter)
    .to(EventEmitter<IAppEvents>)
    .inRequestScope();
container.bind<IEventService>(TYPES.EventService).to(EventService)
    .inSingletonScope;
container
    .bind<IStateManager>(TYPES.StateManager)
    .to(StateManager)
    .inSingletonScope();
container
    .bind<IDecoratedLogger>(TYPES.DebuggingLogger)
    .to(DebuggingLogger)
    .inRequestScope();
container
    .bind<IInitializer>(TYPES.Initializer)
    .to(Initializer)
    .inSingletonScope();
container
    .bind<IFormManager>(TYPES.FormManager)
    .to(FormManager)
    .inSingletonScope();
container.bind<IFormParser>(TYPES.FormParser).to(FormParser).inSingletonScope();
container
    .bind<IFormObserver>(TYPES.FormObserver)
    .to(FormObserver)
    .inSingletonScope();
container
    .bind<IFormFactory>(TYPES.FormFactory)
    .to(FormFactory)
    .inSingletonScope();
container
    .bind<IObservableCollection<IForm>>(TYPES.ObservableFormsCollection)
    .to(ObservableCollection<IForm>)
    .inSingletonScope();
container
    .bind<IDebouncerManager>(TYPES.DebouncerManager)
    .to(DebouncerManager)
    .inSingletonScope();
container
    .bind<IDebouncerFactory>(TYPES.DebouncerFactory)
    .to(DebouncerFactory)
    .inSingletonScope();
container
    .bind<IValidationService>(TYPES.ValidationService)
    .to(ValidationService)
    .inSingletonScope();

export { container };
