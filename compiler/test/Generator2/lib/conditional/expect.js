var func = function (binding, options) {
  const nex1 = new (WX.View ? WX.View : WX.Element)("nex1_", options);
  nex1.setAttribute("id", "nex1");
  if (1 + 5 * 2 ? 12345 : false) {
    nex1.setText(`"123"`);
  }
  return [nex1];
};
func;
