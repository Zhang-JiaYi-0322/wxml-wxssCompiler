var func = function (binding, options) {
  const nex1 = new (WX.View ? WX.View : WX.Element)("nex1_", options);
  nex1.setAttribute("id", "nex1");
  nex1.setAttribute("class", "container log-list");
  const nex2 = new (WX.Block ? WX.Block : WX.Element)("nex2_", options);
  nex2.setAttribute("id", "nex2");
  nex1.appendChild(nex2);
  const logs = binding.logs;
  for (let index = 0; index < logs.length; index++) {
    let log = logs[index];
    const nex3 = new (WX.Text ? WX.Text : WX.Element)("nex3_", options);
    nex3.setAttribute("id", "nex3");
    nex2.appendChild(nex3);
    const index = binding.index;
    nex3.setAttribute("class", "log-item");
    nex3.setText(`${index + 1}.${log}`);
  }
  return [nex1];
};
func;
