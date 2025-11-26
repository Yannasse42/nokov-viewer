import matplotlib.pyplot as plt
import pandas as pd
import scipy.signal as sc
import numpy as np
import matplotlib.gridspec as gridspec
from matplotlib.colors import LinearSegmentedColormap
from collections import defaultdict
from datetime import date, datetime

def gait_direction(pelvis):
    x_displacement = np.max(pelvis["X"]) - np.min(pelvis["X"])
    y_displacement = np.max(pelvis["Y"]) - np.min(pelvis["Y"])
    axis = "Y" if y_displacement > x_displacement else "X"
    return axis


def heel_strike(heel, toe, pelvis ): 
    """
    Detects heel strike events during gait based on distance 
    of the heel relative to the pelvis. (Based on Zeni and al. 2008 paper)

    Parameters:
    ----------
    heel_y : pandas.Series
        Y position of the heel over time.
    pelvis_y : pandas.Series
        Y position of the pelvis over time.

    Returns:
    -------
    pks_heel : numpy.ndarray
        Indices of the detected heel strike events.

    Description:
    -----------
    The function calculates the Y axis distance between the heel and pelvis.
    It then detects peaks in this distance using scipy.signal.find_peaks, 
    depending on the direction of walking (forward or backward).
    A prominence threshold of 100 is used to ensure only significant peaks are retained.
    """
    dist_heel = heel - pelvis
    
    if toe.iloc[0] > heel.iloc[0]:
        pks_heel,_ = sc.find_peaks(dist_heel, prominence=100)
    else:
        pks_heel,_ = sc.find_peaks(-dist_heel, prominence=100)
    # plt.plot(dist_heel)
    return pks_heel


def toe_off(toe, heel, pelvis): 
    """
    Detects Toe off events during gait based on distance 
    of the heel relative to the pelvis. (Based on Zeni and al. 2008 paper)

    Parameters:
    ----------
    heel_y : pandas.Series
        Y position of the heel over time.
    pelvis_y : pandas.Series
        Y position of the pelvis over time.

    Returns:
    -------
    pks_heel : numpy.ndarray
        Indices of the detected Toe off events.

    Description:
    -----------
    The function calculates the Y axis distance between the heel and pelvis.
    It then detects peaks in this distance using scipy.signal.find_peaks, 
    depending on the direction of walking (forward or backward).
    A prominence threshold of 100 is used to ensure only significant peaks are retained.
    """
    dist_toe = toe - pelvis
    # plt.plot(dist_toe)
    if heel.iloc[0] < toe.iloc[0]:
        pks_toe,_ = sc.find_peaks(-dist_toe, prominence=100)
    else:
        pks_toe,_ = sc.find_peaks(dist_toe, prominence=100)

    return pks_toe


def gait_phase(heel_strike, toe_off, heel_strike_contro, toe_off_contro, y_plot = [-200, 200], plot=False):
    """
    Computes and optionally visualizes gait cycle phases based on heel strikes and toe-offs 
    from both the ipsilateral and contralateral limbs.

    Parameters:
    ----------
    heel_strike : list or array-like
        Indices or time points of heel strikes for the main leg.
    toe_off : list or array-like
        Indices or time points of toe-offs for the main leg.
    heel_strike_contro : list or array-like
        Indices or time points of heel strikes for the contralateral leg.
    toe_off_contro : list or array-like
        Indices or time points of toe-offs for the contralateral leg.
    y_plot : list or int, optional
        Vertical range [ymin, ymax] used for plotting events. Default is 0 (no vertical span).
    plot : bool, optional
        If True, visualizes each phase of the gait cycle.

    Returns:
    -------
    results : dict
        Dictionary containing gait cycle metrics (duration, swing %, stance %, double support phases).
    Toe_off_perc : list
        List of toe-off timings expressed as a percentage of the gait cycle.

    Notes:
    -----
    The function processes each gait cycle by identifying the duration between two consecutive heel strikes 
    and computing sub-phase durations such as swing, stance, and double support for both limbs.
    Optionally, the function can plot these events to visualize the temporal structure of the gait cycle.
    It handles both cases where heel strike occurs before toe-off and vice versa to ensure flexibility 
    with different gait event detection algorithms.
    """
    n_cycles = min(len(heel_strike), len(toe_off), len(heel_strike_contro), len(toe_off_contro)) -1

    results = {'cycle_duration' : [],
               'swing_%' : [],
               'stance_%' : [],
               'double_support_1_%' : [],
               'double_support_2_%' : []
               } 

    Toe_off_perc = []

    first_HS_before_TO = heel_strike[0] < toe_off[0]

    all_lists = [heel_strike, toe_off, heel_strike_contro, toe_off_contro]

    # Trouve la liste qui contient le plus petit nombre
    min_list = min(all_lists, key=lambda lst: min(lst))


    for i in range(n_cycles):
        # Vérification si tous les points nécessaires existent
        can_compute = (
            i + 1 < len(heel_strike) and
            i < len(toe_off) and
            i < len(heel_strike_contro) and
            i < len(toe_off_contro)
        )
        if not can_compute:
            break

        if list(min_list) == list(heel_strike):


            DC1 = heel_strike[i+1] - heel_strike[i]
            DPO1 = heel_strike[i+1] - toe_off[i]
            DSP1 = DC1 - DPO1

            DAP11 = toe_off_contro[i] - heel_strike[i]
            DAP12 = toe_off[i] - heel_strike_contro[i]

            Toe_off_perc.append((toe_off[i] - heel_strike[i]) / DC1 * 100)

            if plot:
                plt.vlines(x=heel_strike[i], ymin=y_plot[0], ymax=y_plot[1], color='green', label='Heel Strike')
                plt.vlines(x=toe_off[i], ymin=y_plot[0], ymax=y_plot[1], color='red', label='Toe Off')
                # plt.fill_betweenx(y=y_plot, x1=toe_off[i], x2=heel_strike[i+1], color='b', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike_contro[i], x2=toe_off_contro[i], color='r', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike[i], x2=toe_off_contro[i], color='r', alpha=0.5)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike_contro[i], x2=toe_off[i], color='r', alpha=0.5)
                
        elif list(min_list) == list(toe_off):
            # if i+1 >= len(toe_off):
            #     break

            DC1 = heel_strike[i+1] - heel_strike[i]
            DPO1 = heel_strike[i] - toe_off[i]
            DSP1 = DC1 - DPO1

            DAP11 = toe_off_contro[i] - heel_strike[i]
            DAP12 = toe_off[i+1] - heel_strike_contro[i]
            Toe_off_perc.append((toe_off[i+1] - heel_strike[i]) / DC1 *100)
            if plot:
                plt.vlines(x=heel_strike[i], ymin=y_plot[0], ymax=y_plot[1], color='green', label='Heel Strike')
                plt.vlines(x=toe_off[i], ymin=y_plot[0], ymax=y_plot[1], color='red', label='Toe Off')
                # plt.fill_betweenx(y=y_plot, x1=toe_off[i], x2=heel_strike[i], color='b', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=toe_off_contro[i], x2=heel_strike_contro[i+1], color='r', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike[i], x2=toe_off_contro[i], color='r', alpha=0.5)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike_contro[i+1], x2=toe_off[i+1], color='r', alpha=0.5)

        elif list(min_list) == list(toe_off_contro):
            # if i+1 >= len(toe_off):
            #     break

            DC1 = heel_strike[i+1] - heel_strike[i]
            DPO1 = heel_strike[i] - toe_off[i]
            DSP1 = DC1 - DPO1

            DAP11 = toe_off_contro[i+1] - heel_strike[i]
            DAP12 = toe_off[i] - heel_strike_contro[i]
            Toe_off_perc.append((toe_off[i+1] - heel_strike[i]) / DC1 *100)
            if plot:
                plt.vlines(x=heel_strike[i], ymin=y_plot[0], ymax=y_plot[1], color='green', label='Heel Strike')
                plt.vlines(x=toe_off[i], ymin=y_plot[0], ymax=y_plot[1], color='red', label='Toe Off')
                # plt.fill_betweenx(y=y_plot, x1=toe_off[i], x2=heel_strike[i], color='b', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=toe_off_contro[i], x2=heel_strike_contro[i+1], color='r', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike[i], x2=toe_off_contro[i], color='r', alpha=0.5)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike_contro[i+1], x2=toe_off[i+1], color='r', alpha=0.5)

        elif list(min_list) == list(heel_strike_contro):
            # if i+1 >= len(toe_off):
            #     break

            DC1 = heel_strike[i+1] - heel_strike[i]
            DPO1 = heel_strike[i] - toe_off[i]
            DSP1 = DC1 - DPO1

            DAP11 = toe_off_contro[i] - heel_strike[i]
            DAP12 = toe_off[i] - heel_strike_contro[i]
            Toe_off_perc.append((toe_off[i+1] - heel_strike[i]) / DC1 *100)
            if plot:
                plt.vlines(x=heel_strike[i], ymin=y_plot[0], ymax=y_plot[1], color='green', label='Heel Strike')
                plt.vlines(x=toe_off[i], ymin=y_plot[0], ymax=y_plot[1], color='red', label='Toe Off')
                # plt.fill_betweenx(y=y_plot, x1=toe_off[i], x2=heel_strike[i], color='b', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=toe_off_contro[i], x2=heel_strike_contro[i+1], color='r', alpha=0.2)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike[i], x2=toe_off_contro[i], color='r', alpha=0.5)
                # plt.fill_betweenx(y=y_plot, x1=heel_strike_contro[i+1], x2=toe_off[i+1], color='r', alpha=0.5)

        results['cycle_duration'].append(DC1)
        results['swing_%'].append(DPO1 / DC1 * 100)
        results['stance_%'].append(DSP1 / DC1 * 100)
        results['double_support_1_%'].append(DAP11 / DC1 * 100)
        results['double_support_2_%'].append(DAP12 / DC1 * 100)
            

    return results, Toe_off_perc

def markerSet(model_used, trcData, modeles_bank):
    """
    Extracts and renames relevant 3D markers from TRC data 
    based on the selected biomechanical model.

    Parameters:
    - model_used (str): The key identifying the model in the modeles_bank dictionary.
    - trcData (dict or DataFrame-like): Marker tracking data, where each entry corresponds to a marker's time series.
    - modeles_bank (dict): Dictionary mapping each model to its associated marker names.

    Returns:
    - dict: A dictionary containing the selected markers with standardized column names ("X", "Y", "Z").
    """
    marker = modeles_bank[model_used]

    RHeel = trcData[marker['Rheel']]
    RToe = trcData[marker['Rtoe']]

    LHeel = trcData[marker['Lheel']]
    LToe = trcData[marker['Ltoe']]

    pelvis = trcData[marker['pelvis']]

    RankleJC = trcData[marker['RankleJC']]
    LankleJC = trcData[marker['LankleJC']]

    LHeel.columns = ["X", "Y", "Z"]
    RHeel.columns = ["X", "Y", "Z"]
    LToe.columns = ["X", "Y", "Z"]
    RToe.columns = ["X", "Y", "Z"]
    pelvis.columns = ["X", "Y", "Z"]
    LankleJC.columns = ["X", "Y", "Z"]
    RankleJC.columns = ["X", "Y", "Z"]

    marker = {"RHeel" : RHeel,
              "LHeel" : LHeel,
              "RToe" : RToe,
              "LToe" : LToe,
              "pelvis" : pelvis,
              "RankleJC" : RankleJC,
              "LankleJC" : LankleJC
    }

    return marker

def correction(angle_data, model_used, correction_factor_bank):
    """
    Applies joint-specific correction factors to angle data 
    based on the selected biomechanical model.

    Parameters:
    - angle_data (dict): Dictionary containing joint angle time series, 
                         where keys are joint names and values are numeric arrays or Series.
    - model_used (str): Identifier of the biomechanical model to retrieve correction factors.
    - correction_factor_bank (dict): Dictionary mapping model names to joint correction factors.

    Returns:
    - dict: The corrected angle data.
    """
    correction_factor = correction_factor_bank[model_used]
    for joint in angle_data:
        angle_data[joint] = angle_data[joint] * correction_factor[joint]
    return angle_data


def cycle(heelstrike, angleData, nb_points=101):
    """
    Segments and resamples joint angle data into gait cycles based on heel strikes.

    Parameters:
    - heelstrike (dict): Dictionary with keys "Left" and "Right", each containing a list of heel strike frame indices.
    - angleData (dict): Dictionary with keys like "L_Thigh", "L_Shank", etc., each containing joint angle time series (e.g., pandas DataFrames).
    - nb_points (int): Number of points to resample each gait cycle to (default is 101).

    Returns:
    - tuple: Two dictionaries (Left, Right) each with keys "Hip", "Knee", "Ankle", 
             containing lists of resampled gait cycles for each joint.
    """
    cycle_data = {"L": defaultdict(list), "R": defaultdict(list)}
    
    segments = {
        "Hip": "Thigh",
        "Knee": "Shank",
        "Ankle": "Foot"
    }

    for side in ["L", "R"]:
        side_full = "Left" if side == "L" else "Right"
        hs_list = heelstrike[side_full]
        
        for i in range(len(hs_list) - 1):
            start, end = hs_list[i], hs_list[i + 1]
            for joint, segment in segments.items():
                data = angleData[f"{side}_{segment}"].iloc[start:end, :]
                resampled = sc.resample(data, nb_points)
                cycle_data[side][joint].append(resampled)

    return cycle_data["L"], cycle_data["R"]


def compute_kinematic_parameters(cycle_L, cycle_R):
    """
    Computes kinematic parameters (flexion max, index of max flexion, and range of motion) 
    for both left and right gait cycles based on joint angle data.

    Parameters:
    - cycle_L (dict): Dictionary containing joint angle data for the left leg. 
      Keys represent joints (e.g., "Hip", "Knee", "Ankle"), and values are lists of 
      joint angle time series (e.g., numpy arrays or similar).
    - cycle_R (dict): Dictionary containing joint angle data for the right leg. 
      Keys represent joints (e.g., "Hip", "Knee", "Ankle"), and values are lists of 
      joint angle time series (e.g., numpy arrays or similar).

    Returns:
    - tuple: Two pandas DataFrames (one for the left cycle and one for the right cycle), 
             each containing the following kinematic parameters for each joint:
             - "Flex max [joint]": Maximum flexion angle for the joint.
             - "Index flex max [joint]": Index of the frame where maximum flexion occurs.
             - "RoM [joint]": Range of motion (difference between max and min angle) for the joint.
    """

    PLAN_NAME = ["Sag", "Front", "Trans"]

    def extract_params(cycle_data):
        """
        Extracts kinematic parameters (flex max, index of max flexion, and RoM) for each joint 
        in a given cycle data.

        Parameters:
        - cycle_data (dict): Dictionary containing joint angle data for one leg 
          (keys are "Hip", "Knee", "Ankle", and values are lists of joint angle time series).

        Returns:
        - pd.DataFrame: DataFrame containing the kinematic parameters for each joint.
        """
        kinematic_param = {}

        for joint in cycle_data:
            data_list = cycle_data[joint]

            # === 3 PLANS : 0 = sagittal, 1 = frontal, 2 = transverse ===
            for p, pname in zip([0,1,2], PLAN_NAME):

                # Flexion max
                kinematic_param[f"Flex max {joint} {pname}"] = [
                    float(np.max(data[:, p])) for data in data_list
                ]

                # Index flex max
                kinematic_param[f"Index flex max {joint} {pname}"] = [
                    int(np.argmax(data[:, p])) for data in data_list
                ]

                # Range of Motion (ROM)
                kinematic_param[f"RoM {joint} {pname}"] = [
                    float(np.max(data[:, p]) - np.min(data[:, p])) for data in data_list
                ]

        return pd.DataFrame(kinematic_param).round(2)

    return extract_params(cycle_L), extract_params(cycle_R)


def compute_cycle_curves(cycle_L, cycle_R):
    """
    Computes the mean and standard deviation of joint angles over multiple gait cycles 
    for both the left and right legs.

    Parameters:
    - cycle_L (dict): Dictionary containing joint angle data for the left leg. 
      Keys are joints (e.g., "Hip", "Knee", "Ankle"), and values are lists of joint angle time series.
    - cycle_R (dict): Dictionary containing joint angle data for the right leg. 
      Keys are joints (e.g., "Hip", "Knee", "Ankle"), and values are lists of joint angle time series.

    Returns:
    - tuple: Four dictionaries:
        - mean_cycles_L (dict): Mean joint angles for the left leg across all cycles.
        - std_cycles_L (dict): Standard deviation of joint angles for the left leg across all cycles.
        - mean_cycles_R (dict): Mean joint angles for the right leg across all cycles.
        - std_cycles_R (dict): Standard deviation of joint angles for the right leg across all cycles.
    """
    def compute_stats(cycle_data):
        """
        Computes the mean and standard deviation of joint angles for each joint across multiple cycles.

        Parameters:
        - cycle_data (dict): Dictionary containing joint angle data for one leg (left or right). 
          Keys are joints (e.g., "Hip", "Knee", "Ankle"), and values are lists of joint angle time series.

        Returns:
        - tuple: Two dictionaries:
            - mean_cycles (dict): Mean joint angles for each joint.
            - std_cycles (dict): Standard deviation of joint angles for each joint.
        """
        mean_cycles = {}
        std_cycles = {}
        for joint, data_list in cycle_data.items():
            if data_list:  # Vérifie qu'il y a au moins un cycle
                stacked = np.stack(data_list)  # shape: (n_cycles, n_points)
                mean_cycles[joint] = np.mean(stacked, axis=0)
                std_cycles[joint] = np.std(stacked, axis=0)
            else:
                mean_cycles[joint] = None  # ou np.zeros((101,)) selon besoin
                std_cycles[joint] = None
        return mean_cycles, std_cycles

    mean_cycles_L, std_cycles_L = compute_stats(cycle_L)
    mean_cycles_R, std_cycles_R = compute_stats(cycle_R)

    return mean_cycles_L, std_cycles_L, mean_cycles_R, std_cycles_R


def compute_spatiotemporal_params(traj, heelstrike, toeoff, timestamp):
    """
    Compute spatiotemporal gait parameters from ankle trajectories and gait events.

    Parameters:
        traj (DataFrame): Ankle trajectories with columns ['Ankle_L_x', 'Ankle_L_y', 'Ankle_R_x', 'Ankle_R_y'].
        heelstrike (dict): Dictionary with keys 'L' and 'R' listing heel strike frame indices for left and right foot.
        toeoff (dict): Dictionary with keys 'L' and 'R' listing toe-off frame indices for left and right foot.
        timestamp (Series or array): Time values corresponding to each frame.

    Returns:
        PST_L (DataFrame): Summary of left side gait parameters per cycle.
        PST_R (DataFrame): Summary of right side gait parameters per cycle.
        pst (dict): Raw computed parameters including stride, step, base of support, and phase durations.
    """
    pst = {}

    pas_L = traj['LankleJC'].iloc[heelstrike['Left'], :]
    pas_R = traj['RankleJC'].iloc[heelstrike['Right'], :]

    first_step = 0 if min(heelstrike['Left']) < min(heelstrike['Right']) else 1

    pas = pd.concat([pas_R, pas_L]).sort_index().reset_index(drop=True)

    # Longueur de cycle
    diff_L = pas_L.diff().dropna()
    diff_R = pas_R.diff().dropna()
    cycle_L = np.linalg.norm(diff_L, axis=1)
    cycle_R = np.linalg.norm(diff_R, axis=1)

    pst["stride_length_L"] = [cycle_L.mean(), cycle_L.std()]
    pst["stride_length_R"] = [cycle_R.mean(), cycle_R.std()]

    # Phases du cycle
    cycle_phase_R, _ = gait_phase(heelstrike['Right'], toeoff['Right'], heelstrike['Left'], toeoff['Left'])
    cycle_phase_L, _ = gait_phase(heelstrike['Left'], toeoff['Left'], heelstrike['Right'], toeoff['Right'])

    pst['Swing_phase_R'] = [np.mean(cycle_phase_R['swing_%']), np.std(cycle_phase_R['swing_%'])]
    pst['Stance_phase_R'] = [np.mean(cycle_phase_R['stance_%']), np.std(cycle_phase_R['stance_%'])]
    pst['double_support_R'] = [
        np.mean([a + b for a, b in zip(cycle_phase_R['double_support_1_%'], cycle_phase_R['double_support_2_%'])]),
        np.std(cycle_phase_R['double_support_1_%'] + cycle_phase_R['double_support_2_%'])
    ]

    pst['Swing_phase_L'] = [np.mean(cycle_phase_L['swing_%']), np.std(cycle_phase_L['swing_%'])]
    pst['Stance_phase_L'] = [np.mean(cycle_phase_L['stance_%']), np.std(cycle_phase_L['stance_%'])]
    pst['double_support_L'] = [
        np.mean([a + b for a, b in zip(cycle_phase_L['double_support_1_%'], cycle_phase_L['double_support_2_%'])]),
        np.std([a + b for a, b in zip(cycle_phase_L['double_support_1_%'], cycle_phase_L['double_support_2_%'])])
    ]

    # Longueur et largeur du pas
    step_length_L, step_length_R = [], []
    support_base_L, support_base_R = [], []

    for i in range(1, len(pas) - 1):
        p1 = pas.iloc[i - 1, :]
        p2 = pas.iloc[i + 1, :]
        p3 = pas.iloc[i, :]

        v = p2 - p1
        w = p3 - p1
        proj_length = np.dot(w, v) / np.dot(v, v)
        p4 = p1 + proj_length * v

        step_length = np.linalg.norm(p1 - p4)
        support_base = np.linalg.norm(p4 - p3)

        if (i + first_step) % 2 == 0:
            step_length_L.append(step_length)
            support_base_L.append(support_base)
        else:
            step_length_R.append(step_length)
            support_base_R.append(support_base)

    pst['step_length_L'] = [np.mean(step_length_L), np.std(step_length_L)]
    pst['step_length_R'] = [np.mean(step_length_R), np.std(step_length_R)]

    pst['support_base_L'] = [np.mean(support_base_L), np.std(support_base_L)]
    pst['support_base_R'] = [np.mean(support_base_R), np.std(support_base_R)]

    # Durée du pas
    # time = trcData.iloc[:, 1]
    t_pas_L = timestamp[heelstrike['Left']]
    t_pas_R = timestamp[heelstrike['Right']]

    t_pas = pd.concat([t_pas_L, t_pas_R]).sort_index().reset_index(drop=True)
    step_time = t_pas.diff().dropna()
    step_time_L, step_time_R = [], []

    for i, t in enumerate(step_time):
        if (i + first_step) % 2 == 0:
            step_time_L.append(t)
        else:
            step_time_R.append(t)

    pst['Step_time_L'] = [np.mean(step_time_L), np.std(step_time_L)]
    pst['Step_time_R'] = [np.mean(step_time_R), np.std(step_time_R)]

    # Durée du cycle
    stride_time_L = t_pas_L.diff().dropna()
    stride_time_R = t_pas_R.diff().dropna()
    pst['Stride_time_L'] = [np.mean(stride_time_L), np.std(stride_time_L)]
    pst['Stride_time_R'] = [np.mean(stride_time_R), np.std(stride_time_R)]

    # Format final
    PST_L = pd.DataFrame({k: v for k, v in pst.items() if "_L" in k}).transpose().round(2)
    PST_R = pd.DataFrame({k: v for k, v in pst.items() if "_R" in k}).transpose().round(2)
    PST_L.columns = ['Mean', 'STD']
    PST_R.columns = ['Mean', 'STD']

    return PST_L, PST_R, pst

def compute_global_PST(traj, heelstrike, PST_L, PST_R, timestamp):
    global_PST = {}
    distance = np.linalg.norm(traj["pelvis"].iloc[-1] - traj["pelvis"].iloc[0]) / 1000
    global_PST["Distance (m)"] = round(distance,2)
    duree = timestamp.iloc[-1] - timestamp.iloc[0]
    global_PST["Duration (s)"] = round(duree,2)
    global_PST["Speed (m/s)"] = round(distance/duree,2)
    nb_pas = heelstrike['Right'].size + heelstrike['Left'].size - 1
    cadence = nb_pas/(duree/60)
    global_PST["Cadence (step/min)"] = round(cadence,2)

    steplength = (PST_L.loc['step_length_L', 'Mean'] + PST_R.loc['step_length_R', 'Mean'])/2
    global_PST["Walk_ratio"] = round(steplength / cadence,2)
    return global_PST


def calculate_age(born):
    today = date.today()
    born = datetime.strptime(born, '%d/%m/%Y').date()
    
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def normalize_pst(infos, pst, norm_file=r'D:\Nokov\NOKOV\Rapport Nokov\Normals_GP.xlsx'):
    """
    Normalize spatiotemporal gait parameters using reference values from an Excel file.

    Parameters:
        pst (dict): Dictionary of raw gait parameters as output from compute_spatiotemporal_params().
        norm_file (str or Path): Path to an Excel file containing reference values and their ranges.

    Returns:
        pst_norm_L (DataFrame): Normalized left side gait parameters as percentage of normative values.
        pst_norm_R (DataFrame): Normalized right side gait parameters as percentage of normative values.
        val_norm_low (dict): Lower bounds of normative ranges (in %).
        val_norm_high (dict): Upper bounds of normative ranges (in %).
    """
    # Lecture des données de norme
    norm = pd.read_excel(norm_file)
    pivot = pd.read_excel(norm_file, sheet_name='Titles')
    gender = infos['genre']
    birthdate = infos['date']
    age = calculate_age(birthdate)
    # Filtrage des normes
    norm = norm[norm['FieldId'].isin([1, 2, 3, 4, 7, 9, 10, 12])]
    norm = norm[norm['Gender'] == gender]
    norm = norm[(norm['AgeLow'] < age) & (norm['AgeHigh'] >= age)].reset_index(drop=True)
    norm = norm.reindex([0, 1, 4, 2, 3, 5, 6, 7]).reset_index(drop=True)
    
    # Calcul des valeurs de normes moyennes
    val_norm = (norm['NormLow'] + norm['NormHigh']) / 2
    # Création d'une copie de pst pour la normalisation
    pst_norm = pst.copy()

    # Paramètres spatiaux (Longueur du pas, Longueur du cycle, Base de soutien)
    pst_norm['step_length_L'] = ((pst_norm['step_length_L']/np.array(10)) - norm.loc[0,'NormLow']) / (norm.loc[0,'NormLow'] + norm.loc[0,'NormHigh']) * 100
    pst_norm['step_length_R'] = ((pst_norm['step_length_R']/np.array(10)) - norm.loc[0,'NormLow']) / (norm.loc[0,'NormLow'] + norm.loc[0,'NormHigh']) * 100
    pst_norm['stride_length_L'] = ((pst_norm['stride_length_L']/np.array(10)) - norm.loc[1,'NormLow']) / (norm.loc[1,'NormLow'] + norm.loc[1,'NormHigh']) * 100#pst_norm['stride_length_L'] / (val_norm[1] * 10) * 100
    pst_norm['stride_length_R'] = ((pst_norm['stride_length_R']/np.array(10)) - norm.loc[1,'NormLow']) / (norm.loc[1,'NormLow'] + norm.loc[1,'NormHigh']) * 100
    pst_norm['support_base_L'] = ((pst_norm['support_base_L']/np.array(10)) - norm.loc[2,'NormLow']) / (norm.loc[2,'NormLow'] + norm.loc[2,'NormHigh']) * 100#pst_norm['support_base_L'] / (val_norm[2] * 10) * 100
    pst_norm['support_base_R'] = ((pst_norm['support_base_R']/np.array(10)) - norm.loc[2,'NormLow']) / (norm.loc[2,'NormLow'] + norm.loc[2,'NormHigh']) * 100

    # Paramètres temporels (Temps du pas, Temps du cycle)
    pst_norm['Step_time_R'] = pst_norm['Step_time_R'] / (val_norm[3]) * 100
    pst_norm['Step_time_L'] = pst_norm['Step_time_L'] / (val_norm[3]) * 100
    pst_norm['Stride_time_R'] = pst_norm['Stride_time_R'] / (val_norm[4]) * 100
    pst_norm['Stride_time_L'] = pst_norm['Stride_time_L'] / (val_norm[4]) * 100

    # Phase du cycle de marche (Swing, Stance, Double Support)
    pst_norm['Swing_phase_R'] = pst_norm['Swing_phase_R'] / (val_norm[5]) * 100
    pst_norm['Swing_phase_L'] = pst_norm['Swing_phase_L'] / (val_norm[5]) * 100
    pst_norm['Stance_phase_R'] = pst_norm['Stance_phase_R'] / (val_norm[6]) * 100
    pst_norm['Stance_phase_L'] = pst_norm['Stance_phase_L'] / (val_norm[6]) * 100
    pst_norm['double_support_R'] = pst_norm['double_support_R'] / (val_norm[7]) * 100
    pst_norm['double_support_L'] = pst_norm['double_support_L'] / (val_norm[7]) * 100

    # Séparation des résultats par côté gauche et droit
    pst_norm_L = pd.DataFrame({k: v for k, v in pst_norm.items() if "_L" in k}).transpose().round(2)
    pst_norm_R = pd.DataFrame({k: v for k, v in pst_norm.items() if "_R" in k}).transpose().round(2)

    # Renommage des colonnes
    pst_norm_L.columns = ['Mean', 'STD']
    pst_norm_R.columns = ['Mean', 'STD']

    # Calcul des valeurs de norme basse et haute
    val_norm_low = norm['NormLow'] / val_norm * 100
    val_norm_high = norm['NormHigh'] / val_norm * 100

    return pst_norm_L, pst_norm_R, val_norm_low, val_norm_high

def radar_plot(df_L, df_R, name=None, savefig = False):
    categories = ["Stride Length", "Swing\nPhase", "Stance\nPhase",
                    "Double\nSupport", "Step Length", "Support\nBase",
                    "Step\nTime", "Stride\nTime"]

    N = len(categories)

    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]

    values_L = df_L.T.loc["Mean"].values.tolist()#[1:]
    values_L += values_L[:1]

    values_R = df_R.T.loc["Mean"].values.tolist()#[1:]
    values_R += values_R[:1]

    lower_bound = [0] * N + [0]
    upper_bound = [100] * N + [100]

    # Some layout stuff ----------------------------------------------
    # Initialize layout in polar coordinates
    fig, ax = plt.subplots(figsize=(12, 12), subplot_kw={"projection": "polar"})

    # Set background color to white, both axis and figure.
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")

    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)
    ax.set_ylim(-200, 200)
    # Add geometries to the plot -------------------------------------
    # See the zorder to manipulate which geometries are on top

    # Add plot to represent the cumulative track lengths

    ax.plot(angles, values_L, color='#c4242c', alpha=0.9, zorder=10, label = "Left")
    ax.fill(angles, values_L, color='#c4242c', alpha=0.2)

    ax.plot(angles, values_R, color='green', alpha=0.9, zorder=10, label = "Right")
    ax.fill(angles, values_R, color='green', alpha=0.2)

    lower_bound = [0] * N + [0]
    upper_bound = [100] * N + [100]

    ax.plot(angles, lower_bound, color='#355474', linewidth=0.5, linestyle='dashed', alpha=0.6)
    ax.plot(angles, upper_bound, color='#355474', linewidth=0.5, linestyle='dashed', alpha=0.6)
    ax.fill_between(angles, lower_bound, upper_bound, color='#355474', alpha=0.5, label='Normal zone')

    # Set the labels
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, size=12, fontweight = 'bold', color = '#355474')

    ax.set_yticklabels([])
    # Adjust padding of the x axis labels ----------------------------
    # This is going to add extra space around the labels for the 
    # ticks of the x axis.
    XTICKS = ax.xaxis.get_major_ticks()
    for i, tick in enumerate(XTICKS):
        if i == 0 or 4:
            tick.set_pad(15)
        else:
            tick.set_pad(30)

    ax.legend(loc='upper right', bbox_to_anchor=(1.2, 1.1))  # x, y > 1 éloignent
    plt.title("Subject's spatiotemporal profile relative to normative values",y = 1.1, fontsize = 20, fontweight = 'bold', color = '#355474')
    
    if savefig:
        if name is None:
            raise ValueError("You must provide a `name` when `savefig=True`.")
        plt.savefig(f"{name}.png", dpi=200, bbox_inches='tight')
    
    return fig
