var func = function (binding, options) {
  const nex1 = new (WX.View ? WX.View : WX.Element)("nex1_", options);
  const array = binding.array;
  nex1.setAttribute("id", "nex1");
  nex1.setText(1 + array[0].msg);
  return [nex1];
};
func;
