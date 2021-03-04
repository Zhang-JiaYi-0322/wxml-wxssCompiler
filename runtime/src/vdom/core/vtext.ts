export class VirtualText {
    TYPE = 'VirtualText';
    text: string = null;

    constructor(text: any) {
        this.text = String(text);
    }
}
