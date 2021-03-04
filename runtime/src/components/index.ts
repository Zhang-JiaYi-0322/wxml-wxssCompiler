import { BaseComponent } from "./basecomponent/BaseComponent";
import { Button } from "./button/Button";
import { Canvas } from "./canvas/Canvas";
import { Image } from "./image/Image";
import { Input } from "./input/Input";
import { Scroll_view } from "./scroll-view/Scroll-view";
import { Switch } from "./switch/Switch";
import { Text } from './text/Text';
import { View } from './view/View';
import "./weui.css";
import "./custom.css";

export const map = {
    BaseComponent: BaseComponent,
    Button: Button,
    View: View,
    Text: Text,
    Image: Image,
    Switch: Switch,
    Scroll_view: Scroll_view,
    Canvas: Canvas,
    Input: Input
};