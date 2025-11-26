import pandas as pd
from io import StringIO

def read_htr(path, segment=['R.Thigh', 'L.Thigh', 'R.Shank', 'L.Shank', 'L.Foot', 'R.Foot'], rot=True, trans=False):
    """
    Lit un fichier HTR et extrait les données de rotation et/ou de translation pour les segments spécifiés.

    Parameters
    ----------
    path : str
        Chemin du fichier HTR à lire.
    segment : list of str, optional
        Liste des segments à extraire (par défaut : ['R.Thigh', 'L.Thigh', 'R.Shank', 'L.Shank', 'L.Foot', 'R.Foot']).
    rot : bool, optional
        Si True, extrait les colonnes de rotation ('Rx', 'Ry', 'Rz') (par défaut : True).
    trans : bool, optional
        Si True, extrait les colonnes de translation ('Tx', 'Ty', 'Tz') (par défaut : False).
        Si `rot` et `trans` sont True, extrait les 6 colonnes ('Tx', 'Ty', 'Tz', 'Rx', 'Ry', 'Rz').

    Returns
    -------
    dict
        Un dictionnaire où :
        - Les clés sont les noms des segments (avec les points remplacés par des underscores).
        - Les valeurs sont des DataFrames contenant les données sélectionnées.

    Example
    -------
    >>> data = read_htr("chemin/vers/fichier.htr", rot=True, trans=False)
    >>> data.keys()
    dict_keys(['R_Thigh', 'L_Thigh', 'R_Shank', 'L_Shank', 'L_Foot', 'R_Foot'])
    >>> data['R_Thigh'].head()
         Rx      Ry      Rz
    1  0.0  12.34  45.67
    2  1.2  13.56  46.78
    """
    
    if rot and trans: 
        keeped_columns = ['Tx', 'Ty', 'Tz', 'Rx', 'Ry', 'Rz']
    elif rot: 
        keeped_columns = ['Rx', 'Ry', 'Rz']
    elif trans: 
        keeped_columns = ['Tx', 'Ty', 'Tz']
    else:
        raise ValueError("Au moins une des options 'rot' ou 'trans' doit être activée.")

    # Ouvrir le fichier en mode lecture
    with open(path, 'r', encoding='utf-8') as f:
        contenu = f.read()

    split_contenu = contenu.split('[')

    # Filtrer la liste en gardant les segments spécifiés
    filtre_contenu = [element for element in split_contenu if any(mot in element for mot in segment)]
    filtre_contenu = filtre_contenu[2:]  # Suppression des deux premiers éléments inutiles

    dico = {}
    for element in filtre_contenu:
        # Extraire le nom avant le "]" et remplacer les points par des underscores
        name = element.split("]")[0].replace(".", "_")
        data_io = StringIO(element)
        df = pd.read_csv(data_io, sep="\t", skiprows=1).dropna(axis=1)
        df.columns = df.columns.str.strip()
        
        # Sélectionner les colonnes pertinentes
        df = df[keeped_columns]

        dico[name] = df

    return dico
