import { BaseComponent } from "../basecomponent/BaseComponent";
import "./view.css";

export class View extends BaseComponent {


    constructor(key?: string, options?: any) {
        super(key, options);
    }

    onTextChange(value: any): void {
        this.htmlElement.innerText = value;
    }

    createComponent(): void {
        this.htmlElement = document.createElement('view');
    }
}