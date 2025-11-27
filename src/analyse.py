import sys
import json
import math
import pandas as pd
import numpy as np
import os


from nokov import read_htr
from func import (
    markerSet,
    correction,
    gait_direction,
    heel_strike,
    toe_off,
    cycle,
    compute_cycle_curves,
    compute_spatiotemporal_params,
    compute_global_PST,
    compute_kinematic_parameters
)

# -----------------------------------------------------
# 🔥 Fonction LOG SÉCURISÉE : écrit dans stderr
# -----------------------------------------------------
def debug(*args):
    print(*args, file=sys.stderr)

# 📦 Lecture des courbes normatives
def load_normative_curves():
    excel_path = os.path.join(os.path.dirname(__file__), "Gait_Joint_Angle_Normative_Data.xlsx")
    df = pd.read_excel(excel_path)

    normative = {
        "Hip": {
            "sagittal": {
                "mean": df["Hip Sagittal mean"].tolist(),
                "std": df["Hip Sagittal SD"].tolist()
            },
            "frontal": {
                "mean": df["Hip Frontal mean"].tolist(),
                "std": df["Hip Frontal SD"].tolist()
            },
            "transverse": {
                "mean": df["Hip Longitudinal mean"].tolist(),
                "std": df["Hip Longitudinal SD"].tolist()
            }
        },
        "Knee": {
            "sagittal": {
                "mean": df["Knee Sagittal mean"].tolist(),
                "std": df["Knee Sagittal SD"].tolist()
            },
            "frontal": {
                "mean": df["Knee Frontal mean"].tolist(),
                "std": df["Knee Frontal SD"].tolist()
            },
            "transverse": {
                "mean": df["Knee Longitudinal mean"].tolist(),
                "std": df["Knee Longitudinal SD"].tolist()
            }
        },
        "Ankle": {
            "sagittal": {
                "mean": df["Ankle Sagittal mean"].tolist(),
                "std": df["Ankle Sagittal SD"].tolist()
            },
            "frontal": {
                "mean": df["Ankle Frontal mean"].tolist(),
                "std": df["Ankle Frontal SD"].tolist()
            },
            "transverse": {
                "mean": df["Ankle Longitudinal mean"].tolist(),
                "std": df["Ankle Longitudinal SD"].tolist()
            }
        }
    }

    return normative

# ==========================================================
#  Modèles biomécaniques & facteurs de correction
# ==========================================================

MODELES = {
    'cgm23' : {
    'Rheel' : ["X23", "Y23", "Z23"],
    'Rtoe' : ["X24", "Y24", "Z24"],
    'Lheel' : ["X13", "Y13", "Z13"],
    'Ltoe' : ["X14", "Y14", "Z14"],
    'pelvis' : ["X3.1", "Y3.1", "Z3.1"],
    'RankleJC' : ["X8.1", "Y8.1", "Z8.1"],
    'LankleJC' : ["X9.1", "Y9.1", "Z9.1"],
    'colToKeep' : 104
    },

    "elenhayes" : {
        'Rheel' : ["X8", "Y8", "Z8"],
        'Rtoe' : ["X9", "Y9", "Z9"],
        'Lheel' : ["X14", "Y14", "Z14"],
        'Ltoe' : ["X15", "Y15", "Z15"],
        'pelvis' : ["X2.1", "Y2.1", "Z2.1"],
        'RankleJC' : ["X7.1", "Y7.1", "Z7.1"],
        'LankleJC' : ["X8.1", "Y8.1", "Z8.1"],
        'colToKeep' : 87
    }
}

CORRECTION_FACTOR = {
    "cgm23": {
        "R_Thigh": [-1, -1, 1],
        "L_Thigh": [-1, 1, -1],
        "R_Shank": [1, -1, 1],
        "L_Shank": [1, 1, -1],
        "R_Foot": [-1, -1, -1],
        "L_Foot": [-1, 1, 1],
    },
    "elenhayes": {
        "R_Thigh": [-1, -1, 1],
        "L_Thigh": [-1, 1, 1],
        "R_Shank": [1, -1, 1],
        "L_Shank": [1, 1, -1],
        "R_Foot": [-1, -1, -1],
        "L_Foot": [-1, 1, 1],
    },
}


# ==========================================================
#  FONCTION PRINCIPALE
# ==========================================================

def process(htr_path: str, trc_path: str, modele: str):

    if modele not in MODELES:
        raise ValueError(f"Modèle inconnu : {modele}")
    
        # 🔍 Vérifier s'il existe un fichier static dans le dossier
    folder = os.path.dirname(htr_path)
    basename = os.path.basename(htr_path)

    static_used = False
    for f in os.listdir(folder):
        if f.endswith(".htr") and "_dynamic" not in f.lower() and f != basename:
            static_used = True
            debug(f"Static détecté : {f} → correction dynamique appliquée")
            break

    if not static_used:
        debug("⚠️ Aucun fichier static détecté → angles NON corrigés, discrets masqués")


    # 1) Lecture HTR
    angleData = read_htr(
        htr_path,
        segment=["R.Thigh", "L.Thigh", "R.Shank", "L.Shank", "L.Foot", "R.Foot"],
        rot=True,
        trans=False,
    )

    # 2) Lecture TRC
    trcData = pd.read_csv(trc_path, skiprows=4, sep="\t")
    trcData = trcData.iloc[:,0:MODELES[modele]['colToKeep']].dropna(axis=0)

    timestamp = trcData.iloc[:, 1]

    # 3) Trajectoires
    traj = markerSet(modele, trcData, modeles_bank=MODELES)


    # 4) Correction angles
    angleData = correction(angleData, modele, correction_factor_bank=CORRECTION_FACTOR)

    # 5) Axe marche
    axis = gait_direction(traj["pelvis"])

    # 6) Événements
    heelstrike = {
        "Left": heel_strike(traj["LHeel"][axis], traj["LToe"][axis], traj["pelvis"][axis]),
        "Right": heel_strike(traj["RHeel"][axis], traj["RToe"][axis], traj["pelvis"][axis]),
    }

    toeoff = {
        "Left": toe_off(traj["LToe"][axis], traj["LHeel"][axis], traj["pelvis"][axis]),
        "Right": toe_off(traj["RToe"][axis], traj["RHeel"][axis], traj["pelvis"][axis]),
    }

    # 7) Cycles
    cycle_L, cycle_R = cycle(heelstrike, angleData)

    kin_L, kin_R = compute_kinematic_parameters(cycle_L, cycle_R)


    # 8) Moyennes / SD
    mean_cycles_L, std_cycles_L, mean_cycles_R, std_cycles_R = compute_cycle_curves(
        cycle_L, cycle_R
    )

    # 9) PST
    PST_L_df, PST_R_df, pst_raw = compute_spatiotemporal_params(traj, heelstrike, toeoff, timestamp)
    PST_global = compute_global_PST(traj, heelstrike, PST_L_df, PST_R_df, timestamp)

    # =====================================================
    # 10) PARAMÈTRES DISCRETS (ROM / FlexMax / Index)
    # =====================================================
    kin_L_df, kin_R_df = compute_kinematic_parameters(cycle_L, cycle_R)

    # 👉 Moyenne + écart type pour chaque variable
    kinematic_L_stats = {
        col: {
            "mean": float(kin_L_df[col].mean()),
            "std": float(kin_L_df[col].std())
        }
        for col in kin_L_df.columns
    }

    kinematic_R_stats = {
        col: {
            "mean": float(kin_R_df[col].mean()),
            "std": float(kin_R_df[col].std())
        }
        for col in kin_R_df.columns
    }

    # 👉 Log console clair
    debug("\n===================== KINEMATIC SUMMARY =====================")
    debug("Left:")
    debug(kinematic_L_stats)
    debug("Right:")
    debug(kinematic_R_stats)
    debug("============================================================\n")


    # ----------------------------------------------------
    # 🔥 DEBUG — maintenant sécurisé !
    # ----------------------------------------------------
    debug("\n===================== PST DEBUG =====================")
    debug("Left HS:", heelstrike["Left"])
    debug("Right HS:", heelstrike["Right"])

    debug("\nToeOff:")
    debug("Left TO:", toeoff["Left"])
    debug("Right TO:", toeoff["Right"])

    debug("\nPST RAW:")
    for k, v in pst_raw.items():
        debug(f"{k:20s} = {v}")

    debug("\nPST LEFT DF:")
    debug(PST_L_df)

    debug("\nPST RIGHT DF:")
    debug(PST_R_df)

    debug("\nPST GLOBAL:")
    debug(PST_global)
    debug("======================================================\n")

    # =====================================================
    #  JSON FINAL (STDOUT — propre)
    # =====================================================

    extra_planes_L = {}
    extra_planes_R = {}
    extra_std_L = {}
    extra_std_R = {}

    # === Moyennes Gauche ===
    for joint, arr in mean_cycles_L.items():
        if arr is None:
            extra_planes_L[joint] = None
        else:
            extra_planes_L[joint] = {
                "sagittal":   arr[:, 0].tolist(),
                "frontal":    arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist()
            }

    # === Moyennes Droite ===
    for joint, arr in mean_cycles_R.items():
        if arr is None:
            extra_planes_R[joint] = None
        else:
            extra_planes_R[joint] = {
                "sagittal":   arr[:, 0].tolist(),
                "frontal":    arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist()
            }

    # === STD Gauche ===
    for joint, arr in std_cycles_L.items():
        if arr is None:
            extra_std_L[joint] = None
        else:
            extra_std_L[joint] = {
                "sagittal":   arr[:, 0].tolist(),
                "frontal":    arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist()
            }

    # === STD Droite (MANQUAIT !) ===
    for joint, arr in std_cycles_R.items():
        if arr is None:
            extra_std_R[joint] = None
        else:
            extra_std_R[joint] = {
                "sagittal":   arr[:, 0].tolist(),
                "frontal":    arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist()
            }



    def np_array_to_list(arr):
        if arr is None:
            return None
        return arr[:, 0].tolist()

    def cycles_to_serializable(dico):
        return {joint: np_array_to_list(arr) for joint, arr in dico.items()}

    def pst_df_to_dict(df):
        return {idx: [float(row["Mean"]), float(row["STD"])] for idx, row in df.iterrows()}

    def pst_raw_to_dict(p):
        return {k: [float(v[0]), float(v[1])] for k, v in p.items()}
    
    normative_curves = None
    if static_used:
        debug("📚 Chargement des courbes normatives (Hip / Knee / Ankle)")
        normative_curves = load_normative_curves()

        debug("\n================= NORMATIVE CURVES LOADED =================")
        for joint, planes in normative_curves.items():
            debug(f"\n--- {joint.upper()} ---")
            for plane, stats in planes.items():
                debug(f"{plane.capitalize()} -> "
                    f"Mean length: {len(stats['mean'])}, "
                    f"STD length: {len(stats['std'])}")
                
                # Print first 5 values for quick check
                debug(f"Sample Mean: {stats['mean'][:5]}")
                debug(f"Sample STD : {stats['std'][:5]}")

        debug("==========================================================\n")

    else:
        debug("🚫 Pas de static → pas de courbes normatives affichées")

    return {
        "htr_file": htr_path,
        "trc_file": trc_path,
        "modele": modele,
        "axis": axis,
        "heelstrike": {k: v.tolist() for k, v in heelstrike.items()},
        "toeoff": {k: v.tolist() for k, v in toeoff.items()},
        "mean_cycles_L": cycles_to_serializable(mean_cycles_L),
        "std_cycles_L": cycles_to_serializable(std_cycles_L),
        "mean_cycles_R": cycles_to_serializable(mean_cycles_R),
        "std_cycles_R": cycles_to_serializable(std_cycles_R),
        "PST_L": pst_df_to_dict(PST_L_df),
        "PST_R": pst_df_to_dict(PST_R_df),
        "PST_raw": pst_raw_to_dict(pst_raw),
        "PST_global": {k: float(v) for k, v in PST_global.items()},
        "planes_L": extra_planes_L,
        "planes_R": extra_planes_R,
        "planes_std_L": extra_std_L,
        "planes_std_R": extra_std_R,
        # 🔥 Nouveaux exports : stats cinématiques sagittales
        "kinematic_L_meanstd": kinematic_L_stats,
        "kinematic_R_meanstd": kinematic_R_stats,

        "normative_curves": normative_curves,
    }

# ==========================================================
#  Entrée ligne de commande (appel par Electron)
# ==========================================================

if __name__ == "__main__":
    args = json.loads(sys.argv[1])
    res = process(args["htr"], args["trc"], args["modele"])
    print(json.dumps(res))
