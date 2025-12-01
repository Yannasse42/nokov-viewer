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
#  LECTURE & TRAITEMENT FICHIER FORCE
# ==========================================================

def load_force_data(force_path, timestamp, heelstrike, toeoff):
    """
    Charge le fichier force, extrait :
      - sample_rate / cam_rate
      - Fx, Fy, Fz, COPx, COPy
      - cycles de force synchronisés aux cycles de marche
      - un cycle normalisé 0–100% (per percent_cycle_L/R)
      - side sur la plateforme (L/R)
      - speed à partir du COP
    Retourne un dict force_data ou None.
    """
    if not force_path or not os.path.exists(force_path):
        debug("🚫 No force file provided or not found")
        return None

    try:
        # Détection séparateur
        with open(force_path, "r", encoding="utf-8") as f:
            head = "".join([next(f) for _ in range(10)])

        sep = ";" if ";" in head else "\t"
        skip = 4  # Nokov : 4 lignes d'en-tête

        df_force = pd.read_csv(force_path, sep=sep, skiprows=skip, engine="python")
        df_force.columns = df_force.columns.str.strip()

        debug(f"📊 FORCE loaded: {force_path}")
        debug(f"Columns: {list(df_force.columns)}")

        force_data = {}

        # ---- Sample rate ----
        sample_rate = None
        try:
            with open(force_path, "r") as f:
                for _ in range(10):  # premières lignes
                    line = f.readline()
                    if not line:
                        break
                    if "SampleRate" in line:
                        sample_rate = float(line.split("=")[1].strip())
                        break

            if sample_rate is None:
                raise ValueError("SampleRate not found in header")

            force_data["sample_rate"] = sample_rate
            debug(f"📏 Force plate sample rate: {sample_rate} Hz")
        except Exception as e:
            debug(f"❌ Failed reading SampleRate: {e}")
            sample_rate = 1000.0
            force_data["sample_rate"] = sample_rate
            debug(f"⚠️ Fallback SampleRate: {sample_rate} Hz")

        # ---- Camera rate (via TRC timestamp) ----
        try:
            ts = np.asarray(timestamp, dtype=float)
            dt = float(np.diff(ts).mean())
            cam_rate = 1.0 / dt if dt > 0 else None
            if cam_rate is not None:
                force_data["cam_rate"] = cam_rate
                debug(f"🎥 Camera rate (from TRC): {cam_rate:.2f} Hz")
        except Exception as e:
            debug(f"⚠️ Unable to compute camera rate: {e}")

        # ---- Mapping colonnes Fx, Fy, Fz, COPx, COPy ----
        mapping = {
            "Fx": ["Fx", "Fx (N)", "FX1"],
            "Fy": ["Fy", "Fy (N)", "FY1"],
            "Fz": ["Fz", "Fz (N)", "FZ1"],
            "COPx": ["COPx", "COPx (mm)", "X1"],
            "COPy": ["COPy", "COPy (mm)", "Y1"],
        }

        for key, possible_names in mapping.items():
            for name in possible_names:
                if name in df_force:
                    force_data[key] = df_force[name].tolist()
                    break

        debug(f"🟢 FORCE parsed keys: {list(force_data.keys())}")

        # ---- Preview court (pas de pavé) ----
        debug("\n===== GRF PREVIEW (first 10) =====")
        for key in ["Fx", "Fy", "Fz", "COPx", "COPy"]:
            if key in force_data:
                vals = force_data[key][:10]
                debug(f"{key}: {', '.join(f'{v:.3f}' for v in vals)}")
        debug("===================================\n")

        # ---- Vitesse CoP (pour heatmap) ----
        if all(k in force_data for k in ["COPx", "COPy", "Fz"]):
            arr = np.column_stack((force_data["COPx"], force_data["COPy"]))
            Fz_arr = np.array(force_data["Fz"])
            valid = Fz_arr > 16.5
            arr_valid = arr[valid]

            if len(arr_valid) > 1:
                # Norme déplacement entre frames → cm/s (arbitraire 10)
                speed_valid = np.linalg.norm(np.diff(arr_valid, axis=0), axis=1)
                speed_valid = np.insert(speed_valid, 0, 0) * 10
            else:
                speed_valid = np.zeros(np.sum(valid))

            speed = np.zeros(len(arr))
            speed[valid] = speed_valid

            force_data["speed"] = speed.tolist()

        # ---- Sync cycles force & événements temporels ----
        hs_L = heelstrike.get("Left")
        to_L = toeoff.get("Left")
        hs_R = heelstrike.get("Right")
        to_R = toeoff.get("Right")

        if any(v is None for v in [hs_L, to_L, hs_R, to_R]):
            debug("⚠️ Heelstrike/ToeOff keys mismatch")
            return force_data

        cam_rate = force_data.get("cam_rate", 100.0)
        force_rate = force_data.get("sample_rate", 1000.0)
        ratio = force_rate / cam_rate

        force_cycles = {"Left": [], "Right": []}

        def extract_cycle(hs_frame, to_frame, side):
            hs_f = int(round(hs_frame * ratio))
            to_f = int(round(to_frame * ratio))

            cycle_dict = {
                "Fx": force_data["Fx"][hs_f:to_f],
                "Fy": force_data["Fy"][hs_f:to_f],
                "Fz": force_data["Fz"][hs_f:to_f],
                "COPx": force_data["COPx"][hs_f:to_f],
                "COPy": force_data["COPy"][hs_f:to_f],
                "start_force": hs_f,
                "end_force": to_f,
            }
            force_cycles[side].append(cycle_dict)

        for hs, to in zip(hs_L, to_L):
            extract_cycle(hs, to, "Left")
        for hs, to in zip(hs_R, to_R):
            extract_cycle(hs, to, "Right")

        force_data["cycles"] = force_cycles

        # ---- Cycles normalisés 0–100% ----
        def compute_percent_cycle(hs_list, to_list):
            cycles = []

            for i in range(len(hs_list) - 1):
                hs = hs_list[i]
                hs_next = hs_list[i + 1]

                # Toe-Off entre 2 HS
                to = None
                for t in to_list:
                    if hs < t < hs_next:
                        to = t
                        break
                if to is None:
                    debug(f"❌ Aucun TO trouvé pour le cycle HS {hs} → HS_next {hs_next}")
                    continue

                start = int(hs * ratio)
                end = int(hs_next * ratio)
                to_force_idx = int(to * ratio)

                fz_segment = np.array(force_data["Fz"][start:end])
                if np.max(fz_segment) < 20:
                    debug(f"⏩ Ignored: HS {hs}→{hs_next} (Fz max {np.max(fz_segment):.1f} < 20N)")
                    continue

                debug(
                    f"🦶 FORCE CYCLE VALID:\n"
                    f"  ➤ HS      = {hs} (force idx {start})\n"
                    f"  ➤ Toe-Off = {to} (force idx {to_force_idx})\n"
                    f"  ➤ HS_next = {hs_next} (force idx {end})\n"
                    f"  ➤ Durée force = {end - start} samples"
                )

                # Interpolation 0 → 100%
                t_force = np.linspace(0, 1, len(fz_segment))
                percent = np.linspace(0, 1, 101)

                fx_segment = np.array(force_data["Fx"][start:end])
                fy_segment = np.array(force_data["Fy"][start:end])
                copx_segment = np.array(force_data["COPx"][start:end])
                copy_segment = np.array(force_data["COPy"][start:end])

                fz_pct = np.interp(percent, t_force, fz_segment)
                fx_pct = np.interp(percent, t_force, fx_segment)
                fy_pct = np.interp(percent, t_force, fy_segment)
                copx_pct = np.interp(percent, t_force, copx_segment)
                copy_pct = np.interp(percent, t_force, copy_segment)

                toe_pct = float((to - hs) / (hs_next - hs) * 100)
                debug(f"  ➤ Toe-Off position = {toe_pct:.2f} %\n")

                cycles.append(
                    {
                        "Fz": fz_pct.tolist(),
                        "Fx": fx_pct.tolist(),
                        "Fy": fy_pct.tolist(),
                        "COPx": copx_pct.tolist(),
                        "COPy": copy_pct.tolist(),
                        "toeoff_percent": toe_pct,
                        "HS_frame": int(hs),
                        "HS_next_frame": int(hs_next),
                        "TO_frame": int(to),
                        "HS_force_idx": int(start),
                        "HS_next_force_idx": int(end),
                        "TO_force_idx": int(to_force_idx),
                    }
                )

                # un cycle suffit pour la visu → break
                break

            return cycles if cycles else None

        cycles_R = compute_percent_cycle(hs_R, to_R)
        cycles_L = compute_percent_cycle(hs_L, to_L)

        # ---- Détection pied sur plaque ----
        impact_idx = next(
            (i for i, f in enumerate(force_data["Fz"]) if f > 20), None
        )
        plate_side = None
        impact_frame = None

        if impact_idx is not None:
            impact_frame = impact_idx / ratio
            last_hs_R = max([h for h in hs_R if h <= impact_frame], default=None)
            last_hs_L = max([h for h in hs_L if h <= impact_frame], default=None)

            if last_hs_R is not None and (last_hs_L is None or last_hs_R > last_hs_L):
                plate_side = "R"
            elif last_hs_L is not None:
                plate_side = "L"

        if impact_idx is not None and impact_frame is not None:
            debug(f"🎯 First Fz impact @ {impact_idx} → frame {impact_frame:.2f}")
        else:
            debug("🎯 Aucun impact Fz > 20N détecté")

        debug(f"🦶 Contact foot detected → {plate_side}")
        force_data["plate_side"] = plate_side

        # ---- Garder seulement les cycles du bon pied ----
        if plate_side == "R" and cycles_R:
            force_data["percent_cycle_R"] = cycles_R
            force_data.pop("percent_cycle_L", None)
            force_data["cycles"] = {"Right": force_cycles["Right"]}
        elif plate_side == "L" and cycles_L:
            force_data["percent_cycle_L"] = cycles_L
            force_data.pop("percent_cycle_R", None)
            force_data["cycles"] = {"Left": force_cycles["Left"]}
        else:
            debug("⚠️ Aucun cycle plateforme détecté")
            force_data["cycles"] = {}

        debug(f"📌 FORCE cycles kept: {list(force_data['cycles'].keys())}")

        return force_data

    except Exception as e:
        debug(f"❌ Error loading force file: {e}")
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
