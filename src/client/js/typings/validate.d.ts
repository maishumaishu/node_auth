declare class FormValidator {
    constructor(formNameOrElement: string | HTMLElement,
        fields?: Array<{ name: string, display?: string, rules: string, depends?: () => boolean }>,
        callback?: (errors, event) => void);
        
    validateForm(): boolean;

    clearErrors():void;
}

declare module 'validate' {
    export = FormValidator;
}