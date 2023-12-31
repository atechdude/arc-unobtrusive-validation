export type ValidationParams = Record<string, any>;
export type ValidationRule = {
    type: "required" | "length" | "range" | "regex" | "compare" | "minlength" | "phone" | "url" | "creditcard" | "fileextensions" | "remote" | "email";
    message: string;
    priority: number;
    maxLength?: number;
    minLength?: number;
    maclength?: number;
    maxRange?: number;
    minRange?: number;
    pattern?: string;
    compareTo?: string;
    phone?: string;
    url?: string;
    creditcard?: string;
    extensions?: string;
    additionalFields?: string;
    remote?: string;
    email?: string;
};
