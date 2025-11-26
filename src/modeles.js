module.exports = {
  modeles: {
    cgm23: {
      Rheel: ["X23", "Y23", "Z23"],
      Rtoe: ["X24", "Y24", "Z24"],
      Lheel: ["X13", "Y13", "Z13"],
      Ltoe: ["X14", "Y14", "Z14"],
      pelvis: ["X3.1", "Y3.1", "Z3.1"],
      RankleJC: ["X8.1", "Y8.1", "Z8.1"],
      LankleJC: ["X9.1", "Y9.1", "Z9.1"],
    },
    elenhayes: {
      Rheel: ["X8", "Y8", "Z8"],
      Rtoe: ["X9", "Y9", "Z9"],
      Lheel: ["X14", "Y14", "Z14"],
      Ltoe: ["X15", "Y15", "Z15"],
      pelvis: ["X2.1", "Y2.1", "Z2.1"],
      RankleJC: ["X7.1", "Y7.1", "Z7.1"],
      LankleJC: ["X8.1", "Y8.1", "Z8.1"],
    },
  },

  correction_factor: {
    cgm23: {
      R_Thigh: [-1, -1, 1],
      L_Thigh: [-1, 1, -1],
      R_Shank: [1, -1, 1],
      L_Shank: [1, 1, -1],
      R_Foot: [-1, -1, -1],
      L_Foot: [-1, 1, 1],
    },
    elenhayes: {
      R_Thigh: [-1, -1, 1],
      L_Thigh: [-1, 1, 1],
      R_Shank: [1, -1, 1],
      L_Shank: [1, 1, -1],
      R_Foot: [-1, -1, -1],
      L_Foot: [-1, 1, 1],
    },
  }
};
