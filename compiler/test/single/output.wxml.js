var func = function (binding, options) {
  const nex1 = new (WX.View ? WX.View : WX.Element)("nex1_", options);
  nex1.setAttribute("id", "nex1");
  const nex2 = new (WX.View ? WX.View : WX.Element)("nex2_", options);
  nex2.setAttribute("id", "nex2");
  nex1.appendChild(nex2);
  const nex3 = new (WX.Canvas ? WX.Canvas : WX.Element)("nex3_", options);
  nex3.setAttribute("id", "nex3");
  nex2.appendChild(nex3);
  const windowHeight = binding.windowHeight;
  nex3.setAttribute("canvas_id", "myCanvas");
  nex3.setAttribute("style", `width:100%;height:${windowHeight - 80}px;margin: 0;padding: 0;display: block;`);
  const nex4 = new (WX.View ? WX.View : WX.Element)("nex4_", options);
  nex4.setAttribute("id", "nex4");
  nex1.appendChild(nex4);
  nex4.setAttribute("class", "btn-wrap");
  nex4.setAttribute("style", "height:80px");
  const nex5 = new (WX.View ? WX.View : WX.Element)("nex5_", options);
  nex5.setAttribute("id", "nex5");
  nex4.appendChild(nex5);
  nex5.setAttribute("class", "btn-layout");
  const nex6 = new (WX.Button ? WX.Button : WX.Element)("nex6_", options);
  nex6.setAttribute("id", "nex6");
  nex5.appendChild(nex6);
  nex6.setAttribute("class", "btn-pierced btn-width");
  nex6.setAttribute("bindtap", "returnIndex");
  nex6.setText(`换个名字测`);
  const nex7 = new (WX.View ? WX.View : WX.Element)("nex7_", options);
  nex7.setAttribute("id", "nex7");
  nex4.appendChild(nex7);
  nex7.setAttribute("class", "btn-layout");
  const nex8 = new (WX.Button ? WX.Button : WX.Element)("nex8_", options);
  nex8.setAttribute("id", "nex8");
  nex7.appendChild(nex8);
  nex8.setAttribute("class", "btn btn-layout btn-width");
  nex8.setAttribute("bindtap", "saveImage");
  nex8.setText(`保存图片`);
  return [nex1];
};
func;
