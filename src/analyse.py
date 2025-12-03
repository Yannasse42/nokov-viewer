import sys
import json
import os
import numpy as np
import pandas as pd

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
    compute_kinematic_parameters,
)

# ==========================================================
#  UTILITAIRE LOG
# ==========================================================

def debug(*args):
    """Print proprement vers STDERR (log Electron)."""
    print(*args, file=sys.stderr)


# ==========================================================
#  LECTURE DES COURBES NORMATIVES (CSV)
# ==========================================================

def load_normative_curves():
    base = os.path.dirname(__file__)

    # Tentative 1 : à côté du script
    csv_path = os.path.join(base, "Gait_Joint_Angle_Normative_Data.csv")

    # Tentative 2 : dans /src
    if not os.path.exists(csv_path):
        csv_path = os.path.join(base, "src", "Gait_Joint_Angle_Normative_Data.csv")

    if not os.path.exists(csv_path):
        debug(f"❌ Normative CSV not found: {csv_path}")
        return None

    debug(f"📄 Normative CSV loaded: {csv_path}")

    df = pd.read_csv(csv_path, sep=";", decimal=",", encoding="utf-8", engine="python")
    df.columns = df.columns.str.strip()

    debug("===== CSV COLUMN CHECK =====")
    debug(f"Columns: {list(df.columns)}")
    debug(f"Shape  : {df.shape}")
    debug(df.head().to_string())
    debug("============================")

    try:
        normative = {
            "Hip": {
                "sagittal": {
                    "mean": df["Hip Sagittal mean"].tolist(),
                    "std": df["Hip Sagittal SD"].tolist(),
                },
                "frontal": {
                    "mean": df["Hip Frontal mean"].tolist(),
                    "std": df["Hip Frontal SD"].tolist(),
                },
                "transverse": {
                    "mean": df["Hip Longitudinal mean"].tolist(),
                    "std": df["Hip Longitudinal SD"].tolist(),
                },
            },
            "Knee": {
                "sagittal": {
                    "mean": df["Knee Sagittal mean"].tolist(),
                    "std": df["Knee Sagittal SD"].tolist(),
                },
                "frontal": {
                    "mean": df["Knee Frontal mean"].tolist(),
                    "std": df["Knee Frontal SD"].tolist(),
                },
                "transverse": {
                    "mean": df["Knee Longitudinal mean"].tolist(),
                    "std": df["Knee Longitudinal SD"].tolist(),
                },
            },
            "Ankle": {
                "sagittal": {
                    "mean": df["Ankle Sagittal mean"].tolist(),
                    "std": df["Ankle Sagittal SD"].tolist(),
                },
                "frontal": {
                    "mean": df["Ankle Frontal mean"].tolist(),
                    "std": df["Ankle Frontal SD"].tolist(),
                },
                "transverse": {
                    "mean": df["Ankle Longitudinal mean"].tolist(),
                    "std": df["Ankle Longitudinal SD"].tolist(),
                },
            },
        }
    except KeyError as e:
        debug(f"⚠️ ERROR normative column missing: {e}")
        return None

    debug("📊 Normative curves loaded (CSV) ✔")
    return normative


# ==========================================================
#  MODÈLES BIOMÉCANIQUES & FACTEURS DE CORRECTION
# ==========================================================

MODELES = {
    "cgm23": {
        "Rheel": ["X23", "Y23", "Z23"],
        "Rtoe": ["X24", "Y24", "Z24"],
        "Lheel": ["X13", "Y13", "Z13"],
        "Ltoe": ["X14", "Y14", "Z14"],
        "pelvis": ["X3.1", "Y3.1", "Z3.1"],
        "RankleJC": ["X8.1", "Y8.1", "Z8.1"],
        "LankleJC": ["X9.1", "Y9.1", "Z9.1"],
        "colToKeep": 104,
    },
    "elenhayes": {
        "Rheel": ["X8", "Y8", "Z8"],
        "Rtoe": ["X9", "Y9", "Z9"],
        "Lheel": ["X14", "Y14", "Z14"],
        "Ltoe": ["X15", "Y15", "Z15"],
        "pelvis": ["X2.1", "Y2.1", "Z2.1"],
        "RankleJC": ["X7.1", "Y7.1", "Z7.1"],
        "LankleJC": ["X8.1", "Y8.1", "Z8.1"],
        "colToKeep": 87,
    },
}

CORRECTION_FACTOR = {
    "cgm23": {
        "R_Thigh": [-1, -1, -1],
        "L_Thigh": [-1, 1, 1],
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
#  HELPERS GLOBAUX
# ==========================================================

def toeoff_percent_meanstd(heelstrike, toeoff):
    """
    Retourne :
      - Toe-Off en % du cycle pour Left/Right
      - stats (mean / std) par côté
    """
    result_pct = {"Left": [], "Right": []}
    stats = {}

    for side in ["Left", "Right"]:
        hs = heelstrike[side]
        to = toeoff[side]

        for val in to:
            hs_before = hs[hs <= val]
            hs_after = hs[hs > val]
            if len(hs_before) == 0 or len(hs_after) == 0:
                continue

            hs_start = hs_before[-1]
            hs_next = hs_after[0]
            percent = (val - hs_start) / (hs_next - hs_start) * 100
            result_pct[side].append(float(round(percent, 2)))

        arr = result_pct[side]
        if len(arr) > 0:
            stats[side] = {
                "mean": float(np.mean(arr)),
                "std": float(np.std(arr)),
            }
        else:
            stats[side] = {"mean": None, "std": None}

    return result_pct, stats


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

# ==========================================================
#  CHARGEMENT + TRAITEMENT DES DONNÉES FORCE
# ==========================================================

def load_force_data(force_path, timestamp, heelstrike, toeoff):
    """
    On récupère un UNIQUE cycle de force **propre et utilisable**.
    Pourquoi ?
    → Courbes GRF normalisées 0–100%
    → Vecteurs de force cohérents
    → CoP propre et lisible

    NOTE :
      Ce traitement est celui utilisé **en clinique**, pas académique.
    """

    # ------------------------------------------------------
    # 0️⃣ Sécurité → fichier existe ?
    # ------------------------------------------------------
    if not force_path or not os.path.exists(force_path):
        debug("🚫 Pas de fichier force trouvé")
        return None

    try:
        # ------------------------------------------------------
        # 1️⃣ On détecte automatiquement le séparateur
        #    ; ou tabulation selon les exports
        # ------------------------------------------------------
        with open(force_path, "r", encoding="utf-8") as f:
            head = "".join([next(f) for _ in range(10)])
        sep = ";" if ";" in head else "\t"
        skip = 4  # chez Nokov : 4 lignes d’en-tête inutiles

        # On lit le fichier force dans un tableau pandas
        df_force = pd.read_csv(force_path, sep=sep, skiprows=skip, engine="python")
        df_force.columns = df_force.columns.str.strip()  # nettoyage des noms

        debug(f"\n📊 FORCE chargée : {force_path}")
        debug(f"Colonnes trouvées : {list(df_force.columns)}")

        force_data = {}

        # ------------------------------------------------------
        # 2️⃣ On récupère la fréquence d’échantillonnage FORCE
        #    Ex : 1000 Hz = 1000 mesures par seconde
        # ------------------------------------------------------
        try:
            sample_rate = None
            with open(force_path, "r") as f:
                for _ in range(10):  # lecture des lignes d’en-tête
                    line = f.readline()
                    if "SampleRate" in line:
                        sample_rate = float(line.split("=")[1].strip())
                        break

            if sample_rate is None:
                raise ValueError("Pas de SampleRate dans l'en-tête")
        except:
            # Par défaut = 1000 Hz → standard force plate
            sample_rate = 1000.0

        force_data["sample_rate"] = sample_rate
        debug(f"📏 SampleRate Force = {sample_rate:.2f} Hz")

        # ------------------------------------------------------
        # 3️⃣ On calcule la fréquence cinématique (TRC)
        #    à partir des timestamps
        # ------------------------------------------------------
        ts = np.asarray(timestamp, dtype=float)
        dt = float(np.diff(ts).mean())
        cam_rate = 1.0 / dt  # Ex : 1 / 0.01 = 100 Hz
        force_data["cam_rate"] = cam_rate
        debug(f"🎥 CameraRate TRC = {cam_rate:.2f} Hz")

        # ------------------------------------------------------
        # 4️⃣ On mappe les bonnes colonnes (selon export)
        # ------------------------------------------------------
        mapping = {
            "Fx": ["Fx", "Fx (N)", "FX1"],
            "Fy": ["Fy", "Fy (N)", "FY1"],
            "Fz": ["Fz", "Fz (N)", "FZ1"],
            "COPx": ["COPx", "COPx (mm)", "X1"],
            "COPy": ["COPy", "COPy (mm)", "Y1"],
        }

        # On parcourt chaque signal
        for key, names in mapping.items():
            for n in names:
                if n in df_force:
                    force_data[key] = df_force[n].tolist()
                    break

        debug(f"🟢 Colonnes GRF récupérées : {list(force_data.keys())}")

        # ------------------------------------------------------
        # 5️⃣ Nettoyage pré-impact → Fz < 5N = pas de contact
        #     On met à ZERO 👉 pour éviter de détecter du bruit
        # ------------------------------------------------------
        Fz_arr = np.array(force_data["Fz"], dtype=float)
        threshold = 20.0
        n_zero = np.sum(Fz_arr < threshold)
        Fz_arr[Fz_arr < threshold] = 0.0
        force_data["Fz"] = Fz_arr.tolist()
        debug(f"⚙️ Fz filtré : {n_zero} échantillons mis à 0 (<20N)")

        # ------------------------------------------------------
        # 6️⃣ Sync FORCE ↔ CINE
        #     On traduit les frames ciné en index force
        #     Ex : 1 frame = 10 samples force
        # ------------------------------------------------------
        hs_L, to_L = heelstrike["Left"], toeoff["Left"]
        hs_R, to_R = heelstrike["Right"], toeoff["Right"]

        ratio = sample_rate / cam_rate  # chez Tommy : 10

        # On va stocker cycles L/R
        force_cycles = {"Left": [], "Right": []}

        # ------------------------------------------------------
        # 7️⃣ Fonction extraction ET normalisation d’un cycle
        # ------------------------------------------------------
        def compute_percent_cycle(hs_list, to_list):

            cycles = []

            # pour chaque HS jusqu’au prochain HS
            for i in range(len(hs_list)-1):
                hs = hs_list[i]
                hs_next = hs_list[i+1]

                # Cherche le TO dans cette fenêtre
                to = next((t for t in to_list if hs < t < hs_next), None)
                if to is None:
                    continue

                # Passage en indices force
                start = int(hs * ratio)
                end = int(hs_next * ratio)
                to_idx = int(to * ratio)

                # Segment brut
                fz = np.array(force_data["Fz"][start:end])
                if fz.size == 0 or np.max(fz) < threshold:
                    continue  # aucun vrai contact dans ce cycle

                # ------------------------------------------------------
                # Recalage du HS → on avance jusqu’à Fz > 20N
                # ------------------------------------------------------
                onset = int(np.argmax(fz > threshold))
                start_shifted = start + onset

                # Segments recalés (plus de bruit)
                fz = np.array(force_data["Fz"][start_shifted:end])
                fx = np.array(force_data["Fx"][start_shifted:end])
                fy = np.array(force_data["Fy"][start_shifted:end])
                cx = np.array(force_data["COPx"][start_shifted:end])
                cy = np.array(force_data["COPy"][start_shifted:end])

                if len(fz) < 5:
                    continue

                # ------------------------------------------------------
                # Normalisation 0–100% → INTERPOLATION
                # ------------------------------------------------------
                t = np.linspace(0,1,len(fz))
                pct = np.linspace(0,1,101)

                cycles.append({
                    "Fz": np.interp(pct,t,fz).tolist(),
                    "Fx": np.interp(pct,t,fx).tolist(),
                    "Fy": np.interp(pct,t,fy).tolist(),
                    "COPx": np.interp(pct,t,cx).tolist(),
                    "COPy": np.interp(pct,t,cy).tolist(),

                    # Toe-Off en % stance REALIGNÉ
                    "toeoff_percent": (to_idx-start_shifted)/(end-start_shifted)*100
                })

                # En clinique = 1 cycle pour la visu → stop
                break

            return cycles or None

        # Cycles L/R
        cycles_R = compute_percent_cycle(hs_R,to_R)
        cycles_L = compute_percent_cycle(hs_L,to_L)

        # ------------------------------------------------------
        # 8️⃣ Détection automatique : pied utilisé sur la plaque
        # ------------------------------------------------------
        first_idx = next((i for i, f in enumerate(force_data["Fz"]) if f>0), None)
        impact_frame = first_idx / ratio

        # Compare quel HS était juste avant ce contact
        plate_side = (
            "R" if max([h for h in hs_R if h <= impact_frame]) >
                    max([h for h in hs_L if h <= impact_frame]) else "L"
        )

        force_data["plate_side"] = plate_side

        # ------------------------------------------------------
        # 9️⃣ On ne garde QUE les cycles du bon pied
        # ------------------------------------------------------
        if plate_side=="R" and cycles_R:
            force_data["percent_cycle_R"] = cycles_R
        elif plate_side=="L" and cycles_L:
            force_data["percent_cycle_L"] = cycles_L

        return force_data

    except Exception as e:
        debug(f"❌ Erreur lecture force : {e}")
        return None



# ==========================================================
#  FONCTION PRINCIPALE
# ==========================================================

def process(htr_path: str, trc_path: str, modele: str, force_path: str = None):
    if modele not in MODELES:
        raise ValueError(f"Modèle inconnu : {modele}")

    # ---- Détection static ----
    folder = os.path.dirname(htr_path)
    basename = os.path.basename(htr_path)

    static_used = False
    for f in os.listdir(folder):
        if f.endswith(".htr") and "_dynamic" not in f.lower() and f != basename:
            static_used = True
            debug(f"📚 Static détecté : {f} → correction dynamique appliquée")
            break

    if not static_used:
        debug("⚠️ Aucun fichier static détecté → angles NON corrigés, discrets masqués")

    # ---- Lecture HTR (angles) ----
    angleData = read_htr(
        htr_path,
        segment=["R.Thigh", "L.Thigh", "R.Shank", "L.Shank", "L.Foot", "R.Foot"],
        rot=True,
        trans=False,
    )

    # ---- Lecture TRC (trajectoires) ----
    trcData = pd.read_csv(trc_path, skiprows=4, sep="\t")
    trcData = trcData.iloc[:, 0 : MODELES[modele]["colToKeep"]].dropna(axis=0)
    timestamp = trcData.iloc[:, 1]

    traj = markerSet(modele, trcData, modeles_bank=MODELES)

    # ---- Correction angles selon modèle ----
    angleData = correction(angleData, modele, correction_factor_bank=CORRECTION_FACTOR)

    # ---- Axe de marche ----
    axis = gait_direction(traj["pelvis"])

    # ---- Événements (HS / TO) ----
    heelstrike = {
        "Left": heel_strike(traj["LHeel"][axis], traj["LToe"][axis], traj["pelvis"][axis]),
        "Right": heel_strike(traj["RHeel"][axis], traj["RToe"][axis], traj["pelvis"][axis]),
    }

    toeoff = {
        "Left": toe_off(traj["LToe"][axis], traj["LHeel"][axis], traj["pelvis"][axis]),
        "Right": toe_off(traj["RToe"][axis], traj["RHeel"][axis], traj["pelvis"][axis]),
    }

    # ---- Toe-Off en % du cycle ----
    toeoff_pct, toeoff_stats = toeoff_percent_meanstd(heelstrike, toeoff)

    debug("\nToe-Off en % du cycle :")
    debug(f"Left  : {toeoff_pct['Left']}")
    debug(f"Right : {toeoff_pct['Right']}")
    debug("\nToe-Off Moyennés :")
    debug(
        f"Left  => mean: {toeoff_stats['Left']['mean']:.2f} %, "
        f"std: {toeoff_stats['Left']['std']:.2f}"
    )
    debug(
        f"Right => mean: {toeoff_stats['Right']['mean']:.2f} %, "
        f"std: {toeoff_stats['Right']['std']:.2f}"
    )

    # ---- Cycles cinématiques ----
    cycle_L, cycle_R = cycle(heelstrike, angleData)
    mean_cycles_L, std_cycles_L, mean_cycles_R, std_cycles_R = compute_cycle_curves(
        cycle_L, cycle_R
    )

    # ---- Paramètres discrets (ROM / max / index) ----
    kin_L_df, kin_R_df = compute_kinematic_parameters(cycle_L, cycle_R)

    kinematic_L_stats = {
        col: {"mean": float(kin_L_df[col].mean()), "std": float(kin_L_df[col].std())}
        for col in kin_L_df.columns
    }
    kinematic_R_stats = {
        col: {"mean": float(kin_R_df[col].mean()), "std": float(kin_R_df[col].std())}
        for col in kin_R_df.columns
    }

    debug("\n===================== KINEMATIC SUMMARY =====================")
    debug(f"Left  vars: {list(kin_L_df.columns)}")
    debug(f"Right vars: {list(kin_R_df.columns)}")
    debug("============================================================\n")

    # ---- PST ----
    PST_L_df, PST_R_df, pst_raw = compute_spatiotemporal_params(
        traj, heelstrike, toeoff, timestamp
    )
    PST_global = compute_global_PST(traj, heelstrike, PST_L_df, PST_R_df, timestamp)

    debug("\n===================== PST DEBUG =====================")
    debug(f"Left HS:  {heelstrike['Left']}")
    debug(f"Right HS: {heelstrike['Right']}")
    debug(f"Left TO:  {toeoff['Left']}")
    debug(f"Right TO: {toeoff['Right']}")
    debug("PST RAW keys:", list(pst_raw.keys()))
    debug("PST LEFT shape :", PST_L_df.shape)
    debug("PST RIGHT shape:", PST_R_df.shape)
    debug("PST GLOBAL:", PST_global)
    debug("======================================================\n")

    # ---- Normes (si static) ----
    normative_curves = None
    if static_used:
        debug("📚 Static détecté → tentative de chargement des normes…")
        try:
            normative_curves = load_normative_curves()
            if normative_curves is None:
                debug("⚠ Normes non trouvées → analyse sans courbes normatives")
            else:
                debug("✅ Normes chargées avec succès")
        except Exception as e:
            debug(f"⚠ Erreur lors du chargement des normes : {e}")
            debug("⛔ Passage en mode SANS NORMES")
            normative_curves = None
    else:
        debug("🚫 Pas de static → pas de courbes normatives utilisées")

    # ---- FORCE (optionnel) ----
    force_data = load_force_data(force_path, timestamp, heelstrike, toeoff)

    debug(f"HEELSTRIKE KEYS: {heelstrike.keys()}")
    debug(f"TOEOFF KEYS: {toeoff.keys()}")

    # ---- Préparation des structures pour JSON ----
    extra_planes_L = {}
    extra_planes_R = {}
    extra_std_L = {}
    extra_std_R = {}

    # Moyennes Gauche
    for joint, arr in mean_cycles_L.items():
        if arr is None:
            extra_planes_L[joint] = None
        else:
            extra_planes_L[joint] = {
                "sagittal": arr[:, 0].tolist(),
                "frontal": arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist(),
            }

    # Moyennes Droite
    for joint, arr in mean_cycles_R.items():
        if arr is None:
            extra_planes_R[joint] = None
        else:
            extra_planes_R[joint] = {
                "sagittal": arr[:, 0].tolist(),
                "frontal": arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist(),
            }

    # STD Gauche
    for joint, arr in std_cycles_L.items():
        if arr is None:
            extra_std_L[joint] = None
        else:
            extra_std_L[joint] = {
                "sagittal": arr[:, 0].tolist(),
                "frontal": arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist(),
            }

    # STD Droite
    for joint, arr in std_cycles_R.items():
        if arr is None:
            extra_std_R[joint] = None
        else:
            extra_std_R[joint] = {
                "sagittal": arr[:, 0].tolist(),
                "frontal": arr[:, 1].tolist(),
                "transverse": arr[:, 2].tolist(),
            }

    # ---- JSON FINAL ----
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
        "kinematic_L_meanstd": kinematic_L_stats,
        "kinematic_R_meanstd": kinematic_R_stats,
        "normative_curves": normative_curves,
        "toeoff_percent": toeoff_pct,
        "toeoff_meanstd": toeoff_stats,
        "force": force_data,
    }


# ==========================================================
#  MAIN (APPEL PAR ELECTRON)
# ==========================================================

if __name__ == "__main__":
    args = json.loads(sys.argv[1])
    res = process(
        htr_path=args["htr"],
        trc_path=args["trc"],
        modele=args["modele"],
        force_path=args.get("force"),
    )
    print(json.dumps(res))
