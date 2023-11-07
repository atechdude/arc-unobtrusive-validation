export interface IDebouncer {
    debounce<T extends (...args: any[]) => void>(
        func: T,
        waitMilliseconds: number
    ): void;
    cancel(): void;
}
