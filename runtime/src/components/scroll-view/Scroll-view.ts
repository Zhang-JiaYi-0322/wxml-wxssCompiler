import { BaseComponent } from "../basecomponent/BaseComponent";
import "./scroll-view.css";

export class Scroll_view extends BaseComponent {

    scroll_x: boolean = false;
    scroll_y: boolean = false;

    createComponent(): void {
        const a = this.htmlElement = document.createElement('div');
        
    }

    initStyle(){
        this.htmlElement['style']['overflow'] = 'scroll';
        this.htmlElement['style']['height'] = '100 px';
        this.htmlElement['style']['width'] = '300 px';
    }

    private onAttributeChange_scroll_x = (value: boolean) => {
        this.htmlElement['style']['overflow-x'] = value ? "scroll" : "hidden";
    }

    private onAttributeChange_scroll_y = (value: boolean) => {
        this.htmlElement['style']['overflow-y'] = value ? "scroll" : "hidden";
    }
}