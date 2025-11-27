import pandas as pd
from io import StringIO
import os

def read_htr(path,
             segment=['R.Thigh', 'L.Thigh', 'R.Shank', 'L.Shank', 'L.Foot', 'R_Foot'],
             rot=True,
             trans=False):

    if rot and trans:
        keeped_columns = ['Tx', 'Ty', 'Tz', 'Rx', 'Ry', 'Rz']
    elif rot:
        keeped_columns = ['Rx', 'Ry', 'Rz']
    elif trans:
        keeped_columns = ['Tx', 'Ty', 'Tz']
    else:
        raise ValueError("Au moins une des options 'rot' ou 'trans' doit être activée.")

    folder = os.path.dirname(path)
    basename = os.path.basename(path)

    # Trouver dynamique = celui donné en paramètre (il doit contenir "_dynamic")
    dynamic_file = path

    # Trouver static = fichier .htr dans le même dossier SANS "_dynamic"
    static_file = None
    for f in os.listdir(folder):
        if f.endswith(".htr") and "_dynamic" not in f.lower() and f != basename:
            static_file = os.path.join(folder, f)
            break

    def _load(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            contenu = f.read()

        parts = contenu.split('[')
        parts = [el for el in parts if any(s in el for s in segment)][2:]

        d = {}
        for el in parts:
            name = el.split("]")[0].replace(".", "_")
            df = pd.read_csv(StringIO(el), sep="\t", skiprows=1).dropna(axis=1)
            df.columns = df.columns.str.strip()
            df = df[keeped_columns]
            d[name] = df
        return d

    # Lecture dynamique
    dico = _load(dynamic_file)

    # Si pas de static => retour identique
    if static_file is None:
        return dico

    # Lecture static
    static_data = _load(static_file)

    # Correction : dynamique - moyenne(static)
    for seg in dico:
        if seg in static_data:
            dico[seg] = dico[seg] - static_data[seg].mean()

    return dico
