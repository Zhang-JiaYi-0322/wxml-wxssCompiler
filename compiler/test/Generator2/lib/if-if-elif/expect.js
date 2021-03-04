var func = function (binding, options) {
  const nex1 = new (WX.Button ? WX.Button : WX.Element)("nex1_", options);
  nex1.setAttribute("id", "nex1");
  const nex2 = new (WX.View ? WX.View : WX.Element)("nex2_", options);
  nex2.setAttribute("id", "nex2");
  nex1.appendChild(nex2);
  const t = binding.t;
  const c = binding.c;
  const v = binding.v;
  const a = binding.a;
  nex2.setAttribute("test", t);
  const nex4 = new (WX.View ? WX.View : WX.Element)("nex4_", options);
  nex4.setAttribute("id", "nex4");
  nex1.appendChild(nex4);
  if ("2b") {
    nex2.setText({
      a,
      v,
      c
    });
    const nex3 = new (WX.View ? WX.View : WX.Element)("nex3_", options);
    nex3.setAttribute("id", "nex3");
    nex2.appendChild(nex3);
    if ("a1") {}
  } else if ("3a") {
    nex4.setText(`jynb`);
  }
  nex4.setAttribute("test", "abc");
  return [nex1];
};
func;
