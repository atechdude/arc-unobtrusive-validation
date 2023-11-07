export interface IEventData<T> {
    timestamp: Date;
    source?: string;
    data: T;
}
