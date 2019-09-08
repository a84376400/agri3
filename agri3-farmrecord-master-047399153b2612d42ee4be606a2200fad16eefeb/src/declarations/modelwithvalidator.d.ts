import { Validator, Model } from "sakura-node-3";

export interface ModelWithValidator<T> {
    validator: Validator;
    model?: T;
}