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
    IFormParser,
    IFormService,
    IInitializer,
    ILogger,
    IObservableCollection,
    IStateManager,
    IUIHandler,
    IValidationControlFactory,
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
import { FormFactory } from "../factory/FormFactory";
import { ObservableCollection } from "../classes/ObservableCollection";
import { DebouncerManager } from "../managers/DebounceManager";
import { DebouncerFactory } from "../factory/DebouncerFactory";
import { ValidationService } from "../services/ValidationService";
import { ValidationControlFactory } from "../factory/ValidationControlFactory";
import { UIHandler } from "../classes/UIHandler";
import { IUtil } from "../interfaces/IUtil";
import { Util } from "../utils/util";
import { Form } from "../classes/Form";
import { FormService } from "../services/FormService";

const container = new Container();

container
    .bind<IUtil>(TYPES.Utils)
    .to(Util)
    .inRequestScope();
container
    .bind<ILogger>(TYPES.Logger)
    .to(Logger)
    .inSingletonScope();
container
    .bind<IEventEmitter<IAppEvents>>(TYPES.EventEmitter)
    .to(EventEmitter<IAppEvents>)
    .inRequestScope();
container
    .bind<IFormService>(TYPES.FormService)
    .to(FormService)
    .inSingletonScope();
container
    .bind<IEventService>(TYPES.EventService)
    .to(EventService)
    .inSingletonScope();
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
    .bind<IForm>(TYPES.Form)
    .to(Form)
    .inSingletonScope();
container
    .bind<IFormManager>(TYPES.FormManager)
    .to(FormManager)
    .inSingletonScope();
container
    .bind<IFormParser>(TYPES.FormParser)
    .to(FormParser)
    .inRequestScope();
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
container
    .bind<IValidationControlFactory>(TYPES.ValidationControlFactory)
    .to(ValidationControlFactory)
    .inSingletonScope();
container
    .bind<IUIHandler>(TYPES.UIHandler)
    .to(UIHandler)
    .inRequestScope();

export { container };
