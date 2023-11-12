export interface IValidator<T> {
    isValid: boolean;
    validate(value: T): boolean;
}
