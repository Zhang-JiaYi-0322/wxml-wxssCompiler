var func = function (binding, options) {
  const nex1 = new (WX.View ? WX.View : WX.Element)("nex1_", options);
  const c = binding.c;
  nex1.setAttribute("id", "nex1");
  nex1.setAttribute("test", c);
  for (let index = 0; index < [6, 7, 8, 9].length; index++) {
    let i = [6, 7, 8, 9][index];
    const nex2 = new (WX.View ? WX.View : WX.Element)("nex2_", options);
    nex2.setAttribute("id", "nex2");
    nex1.appendChild(nex2);
    for (let index1 = 0; index1 < [1, 2, 3].length; index1++) {
      let j = [1, 2, 3][index1];
      const nex3 = new (WX.View ? WX.View : WX.Element)("nex3_", options);
      nex3.setAttribute("id", "nex3");
      nex2.appendChild(nex3);
      const a = binding.a;
      const nex4 = new (WX.View ? WX.View : WX.Element)("nex4_", options);
      nex4.setAttribute("id", "nex4");
      nex2.appendChild(nex4);
      if (i <= a) {
        nex3.setText(`${i}*${j}=${i * j}`);
      } else {
        nex4.setText(`12`);
      }
    }
  }
  return [nex1];
};
func;
