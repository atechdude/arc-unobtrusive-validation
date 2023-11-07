export interface IEventEmitter<TEvents> {
    on<K extends keyof TEvents>(
        event: K,
        listener: (data: TEvents[K]) => void
    ): void;
    off<K extends keyof TEvents>(
        event: K,
        listener: (data: TEvents[K]) => void
    ): void;
    emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
}
