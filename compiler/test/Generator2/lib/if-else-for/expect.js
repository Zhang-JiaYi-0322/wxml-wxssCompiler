var func = function (binding, options) {
  const nex1 = new (WX.Button ? WX.Button : WX.Element)("nex1_", options);
  nex1.setAttribute("id", "nex1");
  const nex2 = new (WX.View ? WX.View : WX.Element)("nex2_", options);
  nex2.setAttribute("id", "nex2");
  nex1.appendChild(nex2);
  const c = binding.c;
  const v = binding.v;
  const a = binding.a;
  const nex3 = new (WX.View ? WX.View : WX.Element)("nex3_", options);
  nex3.setAttribute("id", "nex3");
  nex1.appendChild(nex3);
  if ("2b") {
    nex2.setText({
      a,
      v,
      c
    });
  } else if ("3a") {
    nex3.setText(`jynb`);
  }
  const nex4 = new (WX.View ? WX.View : WX.Element)("nex4_", options);
  nex4.setAttribute("id", "nex4");
  nex1.appendChild(nex4);
  for (let f = 0; f < [1, 2, 3].length; f++) {
    let child = [1, 2, 3][f];
    const nex5 = new (WX.View ? WX.View : WX.Element)("nex5_", options);
    nex5.setAttribute("id", "nex5");
    nex4.appendChild(nex5);
    nex5.setText(`123`);
    const nex6 = new (WX.View ? WX.View : WX.Element)("nex6_", options);
    nex6.setAttribute("id", "nex6");
    nex5.appendChild(nex6);
    nex6.setText(`456`);
  }
  return [nex1];
};
func;
