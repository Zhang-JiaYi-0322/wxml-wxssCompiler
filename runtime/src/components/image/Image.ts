import { BaseComponent } from "../basecomponent/BaseComponent";

export class Image extends BaseComponent {

    src:string = '';
    // animation

    createComponent(): void {
        this.htmlElement = document.createElement('img');
    }

    private onAttributeChange_src = (value: string) => {
        this.htmlElement['src'] = value;
    }
}