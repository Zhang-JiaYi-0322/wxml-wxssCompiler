var func = function (binding, options) {
  const nex1 = new (WX.Button ? WX.Button : WX.Element)("nex1_", options);
  const item = binding.item;
  const colorArr = binding.colorArr;
  nex1.setAttribute("id", "nex1");
  nex1.setAttribute("type", colorArr[item.id % 5]);
  nex1.setText(`1.页面主操作`);
  return [nex1];
};
func;
