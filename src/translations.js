const translations = {
    /* ---------------------------------------------------------------------- */
    /* ------------------------------- FRANÇAIS ------------------------------ */
    /* ---------------------------------------------------------------------- */
    fr: {
        app: {
            title: "Nokov Viewer",
        },

        home: {
            welcome: "Bienvenue",
            single: {
                title: "Analyse d’un essai",
                desc: "Importer et analyser une seule marche.",
            },
            compare: {
                title: "Comparer deux essais",
                desc: "Comparer deux sessions de marche.",
            }
        },

        common: {
            back: "Retour",
            choose: "Choisir",
        },

        tabs: {
            curves: "Courbes",
            pst: "PST",
        },

        axes: {
            x_cycle: "Pourcentage du cycle (%)",
            y_angle: "Amplitude (°)"
        },

        planes: {
            label: "Plan :",
            sagittal: "Plan sagittal",
            frontal: "Plan frontal",
            transverse: "Plan transverse"
        },

        single: {
            title: "Analyse d’un essai",
            name: "Nom de l’essai",
            folder: "Dossier de l’essai",
            analyze: "Analyser",
        },

        compare: {
            title: "Comparer deux essais",
            test1: "Essai 1",
            test2: "Essai 2",
            name1: "Nom essai 1",
            name2: "Nom essai 2",
            folder1: "Dossier essai 1",
            folder2: "Dossier essai 2",
            run: "Comparer",
            viewmode: "Mode d’affichage :",
            view6: "Vue : 6 graphes",
            view12: "Vue : 12 graphes",

            global_title: "Paramètres globaux",
            bilat_title: "Paramètres bilatéraux",
            delta_info: "Δ = {e2} − {e1} (positif = augmentation)",
        },

        loading: {
            title: "Chargement…",
        },

        charts: {
            comparison: "Comparaison",
        },

        joint: {
            Hip: "Hanche",
            Knee: "Genou",
            Ankle: "Cheville",
        },

        side: {
            L: "Gauche",
            R: "Droite",
        },

        pst: {
            title: "PST — Paramètres spatio-temporels",
            global_section: "Global",
            left_title: "Côté Gauche",
            right_title: "Côté Droit",

            header_param: "Paramètre",
            header_value: "Valeur",
            header_mean_sd: "Moyenne ± Écart-type",

            distance: "Distance (m)",
            duration: "Durée (s)",
            speed: "Vitesse (m/s)",
            cadence: "Cadence (pas/min)",
            walk_ratio: "Walk Ratio",

            stride_length: "Longueur de foulée (mm)",
            step_length: "Longueur de pas (mm)",
            support_base: "Base de support (mm)",

            step_time: "Temps de pas (s)",
            stride_time: "Temps de cycle (s)",

            swing: "Phase oscillante (%GC)",
            stance: "Phase d'appui (%GC)",
            double_support: "Double appui (%GC)",

            left: "Gauche",
            right: "Droite",
            radar_title: "Profil spatio-temporel (radar)",
            norm: "Norme",

        },
        kinematic: {
            title: "Paramètres cinématiques – {plane}",

            plane: {
                sagittal: "Sagittal (Flex/Ext)",
                frontal: "Frontal (Add/Abd)",
                transverse: "Transverse (Rot int/ext)"
            },

            column: {
                parameter: "Paramètre",
                left: "Gauche (moy ± SD)",
                right: "Droit (moy ± SD)"
            },

            // Sagittal
            flexext: {
                hip: "Pic de flexion / extension hanche",
                knee: "Pic de flexion / extension genou",
                ankle: "Pic de flexion / extension cheville"
            },

            // Frontal
            abdadd: {
                hip: "Pic d’adduction / abduction hanche",
                knee: "Pic d’adduction / abduction genou",
                ankle: "Pic d’adduction / abduction cheville"
            },

            // Transverse
            rotation: {
                hip: "Pic rotation interne / externe hanche",
                knee: "Pic rotation interne / externe genou",
                ankle: "Pic rotation interne / externe cheville"
            },

            index: {
                hip: "Phase du pic (hanche) [% cycle]",
                knee: "Phase du pic (genou) [% cycle]",
                ankle: "Phase du pic (cheville) [% cycle]"
            },

            rom: {
                hip: "Amplitude articulaire hanche",
                knee: "Amplitude articulaire genou",
                ankle: "Amplitude articulaire cheville"
            }
        }

    },

    /* ---------------------------------------------------------------------- */
    /* ------------------------------- ENGLISH ------------------------------- */
    /* ---------------------------------------------------------------------- */
    en: {
        app: {
            title: "Nokov Viewer",
        },

        home: {
            welcome: "Welcome",
            single: {
                title: "Single trial analysis",
                desc: "Import and analyze a single walk.",
            },
            compare: {
                title: "Compare two trials",
                desc: "Compare two walking sessions.",
            }
        },

        common: {
            back: "Back",
            choose: "Select",
        },

        tabs: {
            curves: "Charts",
            pst: "PST",
        },

        axes: {
            x_cycle: "Gait cycle (%)",
            y_angle: "Angle (°)"
        },

        planes: {
            label: "Plane:",
            sagittal: "Sagittal plane",
            frontal: "Frontal plane",
            transverse: "Transverse plane"
        },

        single: {
            title: "Single trial analysis",
            name: "Trial name",
            folder: "Trial folder",
            analyze: "Analyze",
        },

        compare: {
            title: "Compare two trials",
            test1: "Trial 1",
            test2: "Trial 2",
            name1: "Trial 1 name",
            name2: "Trial 2 name",
            folder1: "Trial 1 folder",
            folder2: "Trial 2 folder",
            run: "Compare",
            viewmode: "Display mode:",
            view6: "View: 6 charts",
            view12: "View: 12 charts",

            global_title: "Global parameters",
            bilat_title: "Bilateral parameters",
            delta_info: "Δ = {e2} − {e1} (positive = increase)",
        },

        loading: {
            title: "Loading…",
        },

        charts: {
            comparison: "Comparison",
        },

        joint: {
            Hip: "Hip",
            Knee: "Knee",
            Ankle: "Ankle",
        },

        side: {
            L: "Left",
            R: "Right",
        },

        pst: {
            title: "PST — Spatiotemporal parameters",
            global_section: "Global",
            left_title: "Left Side",
            right_title: "Right Side",

            header_param: "Parameter",
            header_value: "Value",
            header_mean_sd: "Mean ± SD",

            distance: "Distance (m)",
            duration: "Duration (s)",
            speed: "Speed (m/s)",
            cadence: "Cadence (step/min)",
            walk_ratio: "Walk Ratio",

            stride_length: "Stride length (mm)",
            step_length: "Step length (mm)",
            support_base: "Support base (mm)",

            step_time: "Step time (s)",
            stride_time: "Stride time (s)",

            swing: "Swing phase (%GC)",
            stance: "Stance phase (%GC)",
            double_support: "Double support (%GC)",

            left: "Left",
            right: "Right",
            radar_title: "Spatiotemporal profile (radar)",
            norm: "Norm",
        },
        kinematic: {
            title: "Kinematic parameters – {plane}",

            plane: {
                sagittal: "Sagittal (Flex/Ext)",
                frontal: "Frontal (Add/Abd)",
                transverse: "Transverse (Internal/External rotation)"
            },

            column: {
                parameter: "Parameter",
                left: "Left (mean ± SD)",
                right: "Right (mean ± SD)"
            },

            flexext: {
                hip: "Hip flexion/extension peak",
                knee: "Knee flexion/extension peak",
                ankle: "Ankle flexion/extension peak"
            },

            abdadd: {
                hip: "Hip adduction/abduction peak",
                knee: "Knee adduction/abduction peak",
                ankle: "Ankle adduction/abduction peak"
            },

            rotation: {
                hip: "Hip internal/external rotation peak",
                knee: "Knee internal/external rotation peak",
                ankle: "Ankle internal/external rotation peak"
            },

            index: {
                hip: "Peak timing (hip) [% cycle]",
                knee: "Peak timing (knee) [% cycle]",
                ankle: "Peak timing (ankle) [% cycle]"
            },

            rom: {
                hip: "Hip range of motion",
                knee: "Knee range of motion",
                ankle: "Ankle range of motion"
            }
        }

    },

    /* ---------------------------------------------------------------------- */
    /* ------------------------------- CHINESE ------------------------------- */
    /* ---------------------------------------------------------------------- */
    zh: {
        app: {
            title: "Nokov 查看器",
        },

        home: {
            welcome: "欢迎",
            single: {
                title: "单次步态分析",
                desc: "导入并分析一次步态。",
            },
            compare: {
                title: "比较两次步态",
                desc: "比较两次步态测试的数据。",
            }
        },

        common: {
            back: "返回",
            choose: "选择",
        },

        tabs: {
            curves: "曲线",
            pst: "PST",
        },

        axes: {
            x_cycle: "步态周期 (%)",
            y_angle: "角度 (°)"
        },

        planes: {
            label: "平面：",
            sagittal: "矢状面",
            frontal: "冠状面",
            transverse: "横断面"
        },

        single: {
            title: "单次步态分析",
            name: "测试名称",
            folder: "测试文件夹",
            analyze: "分析",
        },

        compare: {
            title: "比较两次步态",
            test1: "测试 1",
            test2: "测试 2",
            name1: "测试 1 名称",
            name2: "测试 2 名称",
            folder1: "测试 1 文件夹",
            folder2: "测试 2 文件夹",
            run: "比较",
            viewmode: "显示模式：",
            view6: "显示：6 张图表",
            view12: "显示：12 张图表",

            global_title: "整体参数",
            bilat_title: "双侧参数",
            delta_info: "Δ = {e2} − {e1}（正值 = 增加）",
        },

        loading: {
            title: "加载中…",
        },

        charts: {
            comparison: "对比",
        },

        joint: {
            Hip: "髋关节",
            Knee: "膝关节",
            Ankle: "踝关节",
        },

        side: {
            L: "左侧",
            R: "右侧",
        },

        pst: {
            title: "PST — 时空参数",
            global_section: "整体",
            left_title: "左侧",
            right_title: "右侧",

            header_param: "参数",
            header_value: "数值",
            header_mean_sd: "平均值 ± 标准差",

            distance: "距离 (m)",
            duration: "时间 (s)",
            speed: "速度 (m/s)",
            cadence: "步频 (步/分钟)",
            walk_ratio: "步态比例",

            stride_length: "步幅 (mm)",
            step_length: "步长 (mm)",
            support_base: "支撑基底 (mm)",

            step_time: "步时 (s)",
            stride_time: "步态周期 (s)",

            swing: "摆动相 (%GC)",
            stance: "支撑相 (%GC)",
            double_support: "双支撑 (%GC)",

            left: "左侧",
            right: "右侧",
            radar_title: "时空参数概况（雷达图）",
            norm: "标准值",
        },
        kinematic: {
            title: "运动学参数 – {plane}",

            plane: {
                sagittal: "矢状面 (屈伸)",
                frontal: "冠状面 (内收/外展)",
                transverse: "横断面 (内旋/外旋)"
            },

            column: {
                parameter: "参数",
                left: "左侧 (平均 ± 标准差)",
                right: "右侧 (平均 ± 标准差)"
            },

            flexext: {
                hip: "髋关节屈曲/伸展峰值",
                knee: "膝关节屈曲/伸展峰值",
                ankle: "踝关节屈曲/伸展峰值"
            },

            abdadd: {
                hip: "髋关节内收/外展峰值",
                knee: "膝关节内收/外展峰值",
                ankle: "踝关节内收/外展峰值"
            },

            rotation: {
                hip: "髋关节内旋/外旋峰值",
                knee: "膝关节内旋/外旋峰值",
                ankle: "踝关节内旋/外旋峰值"
            },

            index: {
                hip: "峰值出现相位 (髋) [% 周期]",
                knee: "峰值出现相位 (膝) [% 周期]",
                ankle: "峰值出现相位 (踝) [% 周期]"
            },

            rom: {
                hip: "髋关节活动度",
                knee: "膝关节活动度",
                ankle: "踝关节活动度"
            }
        }

    }
};
