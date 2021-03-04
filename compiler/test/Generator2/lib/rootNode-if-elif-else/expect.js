var func = function (binding, options) {
  const nex1 = new (WX.View ? WX.View : WX.Element)("nex1_", options);
  const a = binding.a;
  const b = binding.b;
  nex1.setAttribute("id", "nex1");
  const nex2 = new (WX.View ? WX.View : WX.Element)("nex2_", options);
  nex2.setAttribute("id", "nex2");
  const nex3 = new (WX.View ? WX.View : WX.Element)("nex3_", options);
  nex3.setAttribute("id", "nex3");
  if (a > b) {
    nex1.setText(`"a bigber than b"`);
  } else if (a < b) {
    nex2.setText(`"a smaller than b"`);
  } else {
    nex3.setText(`"a equal to b"`);
  }
  return [nex1, nex2, nex3];
};
func;
