import { BaseComponent } from '../components/basecomponent/BaseComponent';
import { wx } from './WX';

export class Canvas {

    private canvas = undefined;
    private htmlElement = null;
    private id = '';

    constructor(id: string) {
        this.id = id;
        const canvasCollection = document.getElementsByTagName('canvas');
        for (const canvas of canvasCollection) {
            if (canvas.id === id) {
                const context = canvas.getContext('2d');
                this.htmlElement = canvas;
                this.canvas = context;
                break;
            }
        }
    }


    setFillStyle(e: any) {
        this.canvas.fillStyle = e;
    }

    drawImage(imageResource: string, dx: number, dy: number, dWidth: number, dHeight: number) {
        const canvas = this.canvas;
        const path = imageResource.split('/').pop();
        if (window['images'][path]) {
            canvas.drawImage(window['images'][path], dx, dy, dWidth, dHeight);
        }
        else {
            const img = new Image();
            img.src = imageResource;

            img.onload = function () {
                canvas.drawImage(img, dx, dy, dWidth, dHeight);
            }.bind(this);
        }
    }

    setFontSize(value: number) {
        this.canvas['font'] = value + 'px Arial';
    }

    setTextAlign(value: string) {
        this.canvas['textAlign'] = value;
    }

    setTextBaseline(value: string) {
        this.canvas['textBaseline'] = value;
    }




    fillRect(x: number, y: number, width: number, height: number) {
        this.canvas.fillRect(x, y, width, height);
    }

    fillText(text: string, x: number, y: number) {
        this.canvas.fillText(text, x, y);
    }

    stroke() {
        this.canvas.stroke();
    }

    draw() {
        this.canvas.fill();
    }

    createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
        return this.canvas.createLinearGradient(x0, y0, x1, y1);
    }
}