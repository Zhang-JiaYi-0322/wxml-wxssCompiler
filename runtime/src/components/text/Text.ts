import { BaseComponent } from "../basecomponent/BaseComponent";
import "./text.css";

export class Text extends BaseComponent {


    constructor(key?: string, options?: any) {
        super(key, options);
    }

    onTextChange(value: any): void {
        this.htmlElement.innerText = value;
    }

    createComponent(): void {
        this.htmlElement = document.createElement('text');
    }
}