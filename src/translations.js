const translations = {
    /* ---------------------------------------------------------------------- */
    /* ------------------------------- FRANÇAIS ------------------------------ */
    /* ---------------------------------------------------------------------- */
    fr: {
        app: {
            title: "Nokov Viewer",
        },

        home: {
            welcome_title: "Bienvenue",
            welcome_subtitle: "Choisissez un mode",
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
            normative: "Norme (±1 ET)" // <-- AJOUT FR
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
            header_mean_sd: "Moyenne ± ET",

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
                left: "Gauche (moy ± ET)",
                right: "Droit (moy ± ET)"
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
        },
        help: {

            home_intro: `
                <h3><strong>Nokov Viewer</strong></h3>
                <p>Choisissez un mode d’analyse pour commencer :</p>
                <ul class="help-list">
                    <li><strong>Analyse d’un essai</strong> : évaluation d’un cycle de marche</li>
                    <li><strong>Comparaison</strong> : suivi de deux essais (ex. évolution clinique)</li>
                </ul>
                <p>
                    Compatible fichiers <strong>HTR/TRC</strong> — Modèles <strong>CGM 1.0 / CGM 2.3 / Helen Hayes</strong>
                </p>
            `,

            one_intro: `
                <h4>Analyse d’un essai</h4>
                <ol class="help-steps">
                    <li>Sélectionner un dossier contenant <strong>.HTR</strong> et <strong>.TRC</strong></li>
                    <li>Détection automatique du modèle biomécanique</li>
                    <li>Analyse incluant :</li>
                </ol>
                <ul class="help-list">
                    <li><strong>Courbes cinématiques</strong></li>
                    <li><strong>Paramètres spatio-temporels (PST)</strong></li>
                    <li><strong>Paramètres cinématiques discrets</strong> (pics + RoM + timing)</li>
                </ul>
                <div class="help-note">
                    La zone grisée correspond à la norme clinique (±1 ET).
                </div>
            `,

            compare_intro: `
                <h4>Comparaison inter-essais</h4>
                <p>Objectiver l’évolution clinique :</p>
                <div class="help-formula">Δ = Essai 2 − Essai 1</div>
                <ul class="help-list">
                    <li><strong>Δ &gt; 0</strong> : augmentation</li>
                    <li><strong>Δ &lt; 0</strong> : diminution</li>
                </ul>
                <p>
                    Utilisation : suivi de rééducation, bilan pré/post-opératoire,
                    analyse d’asymétrie.
                </p>
            `,
            curves_intro: `
                <h4>Courbes cinématiques – Interprétation clinique</h4>

                <p>
                    Chaque graphe représente l’angle articulaire au cours du cycle complet de marche
                    (0–100 % GC). Ces courbes permettent d’évaluer :
                </p>

                <ul class="help-list">
                    <li><strong>Amplitude articulaire</strong> : limitation ou hypermobilité ?</li>
                    <li><strong>Coordination temporelle</strong> : timing des pics physiologique ?</li>
                    <li><strong>Symétrie</strong> : comportements gauche/droit similaires ?</li>
                    <li><strong>Stratégies compensatoires</strong> : rotations ou déviations excessives</li>
                </ul>

                <h5>Axes du graphe</h5>
                <ul class="help-list">
                    <li><strong>Axe X</strong> : % du cycle de marche</li>
                    <li><strong>Axe Y</strong> : angle articulaire (°)</li>
                </ul>

                <h5>Plans biomécaniques</h5>
                <ul class="help-list">
                    <li><strong>Sagittal</strong> : flexion/extension (plan principal de mobilité)</li>
                    <li><strong>Frontal</strong> : stabilité latérale (abduction/adduction)</li>
                    <li><strong>Transverse</strong> : rotation axiale (souvent compensatoire)</li>
                </ul>

                <div class="help-colors">
                    <span class="left-color"></span> Gauche
                    <span class="right-color"></span> Droit
                </div>

                <h5>Norme clinique</h5>
                <p>
                    La zone grisée = population adulte saine (±1 ET).
                    Une courbe en-dehors → altération / compensation potentielle.
                </p>
            `,
            pst_intro: `
                <h4>PST — Paramètres Spatio-Temporaires</h4>

                <p class="help-intro">
                    Les PST évaluent la <strong>performance locomotrice</strong>,
                    la <strong>stabilité dynamique</strong> et la <strong>coordination</strong>
                    du cycle de marche. Ils constituent la base de l’interprétation clinique
                    du déplacement et des stratégies compensatoires.
                </p>

                <!---------------------  SECTION GLOBALE  --------------------->
                <div class="help-section">
                    <h5>Paramètres globaux</h5>
                    <ul class="help-list">
                        <li>
                            <strong>Vitesse (m/s)</strong><br>
                            Indicateur clinique majeur de performance fonctionnelle<br>
                            <span class="help-tip">Un ralentissement est associé à un risque accru de chute</span>
                        </li>
                        <li>
                            <strong>Cadence (pas/min)</strong><br>
                            Nombre de pas par minute<br>
                            <span class="help-tip">Réduit en cas de prudence ou d’altération locomotrice</span>
                        </li>
                        <li>
                            <strong>Distance (m)</strong><br>
                            Longueur totale du parcours mesuré
                        </li>
                        <li>
                            <strong>Durée (s)</strong><br>
                            Temps nécessaire pour parcourir la distance analysée
                        </li>
                        <li>
                            <strong>Walk Ratio</strong><br>
                            Rapport longueur de pas / cadence<br>
                            <span class="help-tip">Mesure l’efficacité locomotrice (économie, fluidité)</span>
                        </li>
                    </ul>
                </div>

                <!---------------------  SECTION BILATÉRALE  --------------------->
                <div class="help-section">
                    <h5>Paramètres bilatéraux (Gauche / Droite)</h5>
                    <ul class="help-list">
                        <li>
                            <strong>Longueur de foulée (mm)</strong><br>
                            Distance entre deux contacts successifs du même pied<br>
                            <span class="help-tip">Représente la capacité de propulsion</span>
                        </li>
                        <li>
                            <strong>Longueur de pas (mm)</strong><br>
                            Distance d’un pied à l’autre<br>
                            <span class="help-tip">Très sensible à l’asymétrie fonctionnelle</span>
                        </li>
                        <li>
                            <strong>Base de support (mm)</strong><br>
                            Largeur entre les deux pieds<br>
                            <span class="help-tip">Augmente pour améliorer le contrôle postural</span>
                        </li>
                        <li><strong>Temps de pas (s)</strong> : durée entre deux contacts alternés</li>
                        <li><strong>Temps de cycle (s)</strong> : durée d’une foulée complète</li>
                        <li>
                            <strong>Phase d’appui (% GC)</strong><br>
                            Temps avec appui au sol<br>
                            <span class="help-tip">Augmentée = recherche de stabilité</span>
                        </li>
                        <li>
                            <strong>Phase oscillante (% GC)</strong><br>
                            Temps sans contact au sol<br>
                            <span class="help-tip">Diminuée si propulsion limitée</span>
                        </li>
                        <li>
                            <strong>Double appui (% GC)</strong><br>
                            Deux pieds au sol simultanément<br>
                            <span class="help-tip">Prolongé = instabilité ou appréhension</span>
                        </li>
                    </ul>
                </div>

                <p class="help-mini-graphs">
                    Dans chaque tableau, un <strong>mini-graphe</strong> visualise la position
                    du patient par rapport à un <strong>intervalle normatif</strong>.
                </p>

                <ul class="help-list">
                    <li>
                        <strong>Zone grisée</strong> → référence clinique (population saine)
                        <br><span class="help-tip">Moyenne ± 1 écart-type</span>
                    </li>
                    <li>
                        <strong>Marqueur coloré</strong> → valeur du patient
                        <br><span class="help-tip">Plus il s’écarte de la zone, plus l’altération est significative</span>
                    </li>
                </ul>

                <p class="help-note">
                    Le mini-graphe facilite l’interprétation <strong>clinique</strong> :
                    il met en évidence <strong>asymétries</strong>, <strong>instabilité</strong>
                    ou <strong>progrès</strong> (en mode comparaison).
                </p>


                <!---------------------  LECTURE CLINIQUE  --------------------->
                <div class="help-section">
                    <h5>Lecture clinique</h5>
                    <ul class="help-list">
                        <li><strong>Performance :</strong> vitesse, cadence, mobilité horizontale</li>
                        <li><strong>Stabilité :</strong> base de support, double appui</li>
                        <li><strong>Coordination :</strong> relation appui ↔ oscillation</li>
                        <li><strong>Symétrie :</strong> comparaison bilatérale des valeurs</li>
                    </ul>
                </div>

                <!---------------------  CODES GRAPHIQUES  --------------------->
                <div class="help-colors">
                    <span class="left-color"></span> Côté gauche
                    <span class="right-color"></span> Côté droit
                </div>

                <div class="help-note">
                    En mode comparaison : 
                    <strong>Δ = Essai 2 − Essai 1</strong> → mesure objective de l’évolution clinique.
                </div>
            `,


            pst_radar_intro: `
                <h4>Radar PST — Profil locomoteur</h4>

                <p>
                    Permet une lecture rapide :
                </p>
                <ul class="help-list">
                    <li><strong>Symétrie gauche/droit</strong></li>
                    <li><strong>Écart à la zone normative</strong></li>
                    <li><strong>Progression entre essais</strong> (mode comparaison)</li>
                </ul>

                <p>
                    Interprétation :
                </p>
                <ul class="help-list">
                    <li>Dans la <strong>zone grisée</strong> → physiologique</li>
                    <li>Au-delà → performance ↑ ou compensation</li>
                    <li>En-deçà → déficit fonctionnel</li>
                </ul>

                <div class="help-note">
                    Objectif rééducation : polygones plus
                    <strong>ronds, grands et symétriques</strong>.
                </div>
            `,

            kinematic_intro: `
                <h4>Paramètres cinématiques discrets</h4>

                <p>
                    Mesurés sur chaque courbe pour synthétiser la fonction articulaire :
                </p>

                <ul class="help-list">
                    <li>
                        <strong>Pic angulaire</strong> :
                        amplitude max → flexibilité, raideur, compensations
                    </li>
                    <li>
                        <strong>Phase du pic</strong> (% GC) :
                        moment du pic → coordination du geste
                    </li>
                    <li>
                        <strong>Amplitude articulaire (RoM)</strong> :
                        exploitation globale de l’articulation
                    </li>
                </ul>

                <div class="help-colors">
                    <span class="left-color"></span> Gauche
                    <span class="right-color"></span> Droit
                </div>

                <p>
                    Indications cliniques :
                </p>
                <ul class="help-list">
                    <li><strong>RoM faible</strong> → limitation articulaire ou appréhension</li>
                    <li><strong>Timing anormal</strong> → trouble de coordination</li>
                    <li><strong>Asymétrie</strong> → compensation d’un déficit</li>
                </ul>

                <div class="help-note">
                    Mode comparaison : Δ (Essai2 − Essai1) → quantification de l’évolution.
                </div>
            `

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
            welcome_title: "Welcome",
            welcome_subtitle: "Choose a mode",
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
            pst: "STP",
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
            normative: "Normative (±1 SD)" // <-- AJOUT EN
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
            title: "STP — Spatiotemporal parameters",
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
        },
        help: {
            home_intro: `
                <h3><strong>Nokov Viewer</strong></h3>
                <p>Select an analysis mode to begin:</p>
                <ul class="help-list">
                    <li><strong>Single trial analysis</strong> – evaluate one gait cycle</li>
                    <li><strong>Comparison</strong> – follow clinical evolution between two sessions</li>
                </ul>
                <p>
                    Supports <strong>HTR/TRC</strong> files — <strong>CGM 1.0 / CGM 2.3 / Helen Hayes</strong> models
                </p>
            `,

            one_intro: `
                <h4>Single trial analysis</h4>
                <ol class="help-steps">
                    <li>Select a folder containing <strong>.HTR</strong> and <strong>.TRC</strong> files</li>
                    <li>Automatic biomechanical model detection</li>
                    <li>Computed results:</li>
                </ol>
                <ul class="help-list">
                    <li><strong>Kinematic curves</strong></li>
                    <li><strong>Spatiotemporal parameters (STP)</strong></li>
                    <li><strong>Discrete kinematic parameters</strong> (peaks + RoM + timing)</li>
                </ul>
                <div class="help-note">
                    Grey band = normative data (±1 SD).
                </div>
            `,

            compare_intro: `
                <h4>Comparison between two trials</h4>
                <p>Used for clinical evolution monitoring:</p>
                <div class="help-formula">Δ = Trial 2 − Trial 1</div>
                <ul class="help-list">
                    <li><strong>Positive Δ</strong> → improvement / increase</li>
                    <li><strong>Negative Δ</strong> → deficit / decrease</li>
                </ul>
                <p>
                    Examples: rehabilitation progress, pre/post-surgery analysis, asymmetry monitoring.
                </p>
            `,
            curves_intro: `
                <h4>Kinematic curves — Clinical interpretation</h4>

                <p>
                    Each chart represents the joint angle throughout the full gait cycle
                    (0–100% GC). These curves allow clinicians to assess:
                </p>

                <ul class="help-list">
                    <li><strong>Joint mobility</strong> – limitation or hypermobility?</li>
                    <li><strong>Timing of movement</strong> – are peak moments physiologic?</li>
                    <li><strong>Symmetry</strong> – similar behavior left vs right?</li>
                    <li><strong>Compensatory strategies</strong> – abnormal rotations / deviations</li>
                </ul>

                <h5>Chart axes</h5>
                <ul class="help-list">
                    <li><strong>X-axis</strong>: % of gait cycle</li>
                    <li><strong>Y-axis</strong>: joint angle (°)</li>
                </ul>

                <h5>Motion planes</h5>
                <ul class="help-list">
                    <li><strong>Sagittal</strong>: flexion/extension (primary mobility)</li>
                    <li><strong>Frontal</strong>: lateral stability (ab/adduction)</li>
                    <li><strong>Transverse</strong>: axial rotation (often compensatory)</li>
                </ul>

                <div class="help-colors">
                    <span class="left-color"></span> Left
                    <span class="right-color"></span> Right
                </div>

                <h5>Normative reference</h5>
                <p>
                    Grey area = healthy adult population (±1 SD).
                    A curve outside the band may indicate dysfunction or compensation.
                </p>
            `,

            pst_intro: `
                <h4>STP — Spatiotemporal Parameters</h4>

                <p class="help-intro">
                    STPs quantify <strong>locomotor performance</strong>,
                    <strong>dynamic stability</strong> and <strong>coordination</strong>
                    during walking. They are essential for clinical interpretation
                    of movement strategies and compensations.
                </p>

                <div class="help-section">
                    <h5>Global parameters</h5>
                    <ul class="help-list">
                        <li><strong>Speed (m/s)</strong><br>
                            Primary indicator of functional performance<br>
                            <span class="help-tip">Slower speed = higher fall risk</span>
                        </li>
                        <li><strong>Cadence (step/min)</strong><br>
                            Number of steps per minute<br>
                            <span class="help-tip">Reduced in cautious or impaired gait</span>
                        </li>
                        <li><strong>Distance (m)</strong> — total walkway distance</li>
                        <li><strong>Duration (s)</strong> — time to complete measurement</li>
                        <li><strong>Walk Ratio</strong><br>
                            Step length / cadence<br>
                            <span class="help-tip">Reflects efficiency and gait strategy</span>
                        </li>
                    </ul>
                </div>

                <div class="help-section">
                    <h5>Bilateral parameters (Left / Right)</h5>
                    <ul class="help-list">
                        <li><strong>Stride length (mm)</strong><br>
                            Distance between two contacts of the same foot<br>
                            <span class="help-tip">Reflects propulsion</span>
                        </li>
                        <li><strong>Step length (mm)</strong><br>
                            Distance between alternate foot contacts<br>
                            <span class="help-tip">Highly sensitive to asymmetry</span>
                        </li>
                        <li><strong>Support base (mm)</strong><br>
                            Width between both feet<br>
                            <span class="help-tip">Increases with balance control demands</span>
                        </li>
                        <li><strong>Step time (s)</strong> — temporal coordination</li>
                        <li><strong>Stride time (s)</strong> — full gait cycle duration</li>
                        <li><strong>Stance phase (%GC)</strong><br>
                            Time in contact with the ground<br>
                            <span class="help-tip">↑ indicates stability or compensation</span>
                        </li>
                        <li><strong>Swing phase (%GC)</strong><br>
                            Time without ground contact<br>
                            <span class="help-tip">↓ if propulsion limitation</span>
                        </li>
                        <li><strong>Double support (%GC)</strong><br>
                            Both feet on the ground simultaneously<br>
                            <span class="help-tip">↑ = instability, fear of falling</span>
                        </li>
                    </ul>
                </div>

                <p class="help-mini-graphs">
                    Mini-charts show the <strong>patient’s position</strong> versus the
                    <strong>normative interval</strong>.
                </p>

                <ul class="help-list">
                    <li><strong>Grey band</strong> → normative reference (±1 SD)</li>
                    <li><strong>Colored marker</strong> → patient’s value
                        <br><span class="help-tip">Further from grey = greater alteration</span>
                    </li>
                </ul>

                <p class="help-note">
                    Mini-charts reveal <strong>asymmetry</strong>, <strong>instability</strong>
                    and <strong>progress</strong> (in comparison mode).
                </p>

                <div class="help-section">
                    <h5>Clinical reading</h5>
                    <ul class="help-list">
                        <li><strong>Performance:</strong> speed, cadence, step length</li>
                        <li><strong>Stability:</strong> double support, support base</li>
                        <li><strong>Coordination:</strong> stance ↔ swing regulation</li>
                        <li><strong>Symmetry:</strong> systematic left/right comparison</li>
                    </ul>
                </div>

                <div class="help-colors">
                    <span class="left-color"></span> Left
                    <span class="right-color"></span> Right
                </div>

                <div class="help-note">
                    In comparison mode:
                    <strong>Δ = Trial 2 − Trial 1</strong>
                    → objective measurement of clinical evolution.
                </div>
            `,
            pst_radar_intro: `
                <h4>STP Radar — Locomotor profile</h4>

                <p>
                    Provides a fast visual interpretation of:
                </p>
                <ul class="help-list">
                    <li><strong>Left/Right symmetry</strong></li>
                    <li><strong>Deviation from the normative range</strong></li>
                    <li><strong>Evolution between trials</strong> (comparison mode)</li>
                </ul>

                <p>Interpretation:</p>
                <ul class="help-list">
                    <li>Inside the <strong>grey zone</strong> → physiological</li>
                    <li>Outside → increased performance or compensation</li>
                    <li>Below → functional deficit</li>
                </ul>

                <div class="help-note">
                    Rehabilitation goal: 
                    <strong>larger, smoother and more symmetric</strong> shapes.
                </div>
            `,

            kinematic_intro: `
                <h4>Discrete kinematic parameters</h4>

                <p>
                    Calculated from each curve to summarize joint behavior:
                </p>

                <ul class="help-list">
                    <li><strong>Peak angle</strong> – max amplitude → flexibility / stiffness</li>
                    <li><strong>Peak timing</strong> (%GC) – moment of peak → coordination</li>
                    <li><strong>Range of Motion (RoM)</strong> – overall functional excursion</li>
                </ul>

                <div class="help-colors">
                    <span class="left-color"></span> Left
                    <span class="right-color"></span> Right
                </div>

                <p>Clinical interpretation:</p>
                <ul class="help-list">
                    <li><strong>Low RoM</strong> → restriction or apprehension</li>
                    <li><strong>Abnormal timing</strong> → impaired motor control</li>
                    <li><strong>Asymmetry</strong> → compensation for deficit</li>
                </ul>

                <div class="help-note">
                    In comparison mode: Δ (Trial2 − Trial1) quantifies improvement or deterioration.
                </div>
            `,
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
            welcome_title: "欢迎",
            welcome_subtitle: "选择一种模式",
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
            pst: "时空参数",
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
            normative: "标准范围 (±1 标准差)" // <-- AJOUT CN
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
            title: "时空参数",
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

            swing: "摆动相 (步态周期 %)",
            stance: "支撑相 (步态周期 %)",
            double_support: "双支撑 (步态周期 %)",

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
        },
        help: {
            home_intro: `
                <h3><strong>Nokov Viewer</strong></h3>
                <p>请选择一种分析模式开始：</p>
                <ul class="help-list">
                    <li><strong>单次步态分析</strong> — 评估一次完整步态</li>
                    <li><strong>对比分析</strong> — 比较两次测试的临床变化</li>
                </ul>
                <p>
                    支持 <strong>HTR/TRC</strong> 文件 — <strong>CGM 1.0 / CGM 2.3 / Helen Hayes</strong> 模型
                </p>
            `,

            one_intro: `
                <h4>单次步态分析</h4>
                <ol class="help-steps">
                    <li>选择包含 <strong>.HTR</strong> 和 <strong>.TRC</strong> 文件的文件夹</li>
                    <li>系统将自动识别生物力学模型</li>
                    <li>生成以下分析结果：</li>
                </ol>
                <ul class="help-list">
                    <li><strong>运动学曲线</strong></li>
                    <li><strong>时空参数（STP）</strong></li>
                    <li><strong>离散运动学参数</strong>（峰值 + RoM + 时序）</li>
                </ul>
                <div class="help-note">
                    灰色范围 = 标准参考值（±1 SD）。
                </div>
            `,

            compare_intro: `
                <h4>两次试验对比分析</h4>
                <p>用于跟踪临床变化：</p>
                <div class="help-formula">Δ = 测试 2 − 测试 1</div>
                <ul class="help-list">
                    <li><strong>Δ &gt; 0</strong> → 功能改善 / 增加</li>
                    <li><strong>Δ &lt; 0</strong> → 功能下降 / 减少</li>
                </ul>
                <p>
                    用途示例：康复进展评估、术前/术后分析、步态对称性观察。
                </p>
            `,

            curves_intro: `
                <h4>运动学曲线 — 临床解读</h4>

                <p>
                    每张图展示整个步态周期（0–100% GC）中的关节角度变化。
                    主要用于评估：
                </p>

                <ul class="help-list">
                    <li><strong>关节活动度</strong> — 是否受限或过度？</li>
                    <li><strong>动作时序</strong> — 峰值出现是否符合生理？</li>
                    <li><strong>对称性</strong> — 左右差异？</li>
                    <li><strong>代偿策略</strong> — 异常旋转或偏移？</li>
                </ul>

                <h5>图表坐标解释</h5>
                <ul class="help-list">
                    <li><strong>X 轴</strong>: 步态周期百分比</li>
                    <li><strong>Y 轴</strong>: 关节角度（°）</li>
                </ul>

                <h5>运动学平面</h5>
                <ul class="help-list">
                    <li><strong>矢状面</strong>：屈伸（主要活动平面）</li>
                    <li><strong>冠状面</strong>：内外侧稳定性（内收/外展）</li>
                    <li><strong>横断面</strong>：轴向旋转（常用于代偿）</li>
                </ul>

                <div class="help-colors">
                    <span class="left-color"></span> 左侧
                    <span class="right-color"></span> 右侧
                </div>

                <h5>标准区间</h5>
                <p>
                    灰色区域 = 健康成人（±1 SD）。
                    若曲线偏离该区域，则可能提示功能障碍或代偿。
                </p>
            `,

            pst_intro: `
                <h4>STP — 时空参数</h4>

                <p class="help-intro">
                    时空参数用于衡量步态的
                    <strong>功能表现、动态稳定性和协调性</strong>，
                    是临床步态评估的重要核心。
                </p>

                <div class="help-section">
                    <h5>整体参数</h5>
                    <ul class="help-list">
                        <li><strong>速度 (m/s)</strong><br>
                            功能水平首要指标<br>
                            <span class="help-tip">速度下降 = 跌倒风险 ↑</span>
                        </li>
                        <li><strong>步频 (步/分钟)</strong><br>
                            每分钟步数<br>
                            <span class="help-tip">减慢常见于谨慎步态或障碍</span>
                        </li>
                        <li><strong>距离 (m)</strong> — 测量区域总长度</li>
                        <li><strong>时间 (s)</strong> — 完成测量所需时间</li>
                        <li><strong>步态比例</strong>（步长/步频）<br>
                            <span class="help-tip">体现步态效率与策略</span>
                        </li>
                    </ul>
                </div>

                <div class="help-section">
                    <h5>双侧参数（左/右）</h5>
                    <ul class="help-list">
                        <li><strong>步幅 (mm)</strong><br>
                            同侧脚两次接触的距离<br>
                            <span class="help-tip">反映推进能力</span>
                        </li>
                        <li><strong>步长 (mm)</strong><br>
                            双脚交替距离<br>
                            <span class="help-tip">对检测对称性非常敏感</span>
                        </li>
                        <li><strong>支撑基底 (mm)</strong><br>
                            双脚之间宽度<br>
                            <span class="help-tip">增大提示平衡需求 ↑</span>
                        </li>
                        <li><strong>步时 (s)</strong> — 步间时间协调</li>
                        <li><strong>步态周期 (s)</strong> — 一次完整步态</li>
                        <li><strong>支撑相 (%GC)</strong><br>
                            与地面接触的时间比例<br>
                            <span class="help-tip">↑ = 稳定性代偿</span>
                        </li>
                        <li><strong>摆动相 (%GC)</strong><br>
                            不接触地面时间比例<br>
                            <span class="help-tip">↓ = 推进能力不足</span>
                        </li>
                        <li><strong>双支撑 (%GC)</strong><br>
                            双脚同时接触地面<br>
                            <span class="help-tip">↑ = 不稳或害怕跌倒</span>
                        </li>
                    </ul>
                </div>

                <p class="help-mini-graphs">
                    每项参数包含 <strong>迷你图</strong> 用于展示
                    相对 <strong>标准区间</strong> 的偏差程度。
                </p>

                <ul class="help-list">
                    <li><strong>灰色带</strong> = 标准值（±1 SD）</li>
                    <li><strong>彩色点</strong> = 患者实际数值
                        <br><span class="help-tip">偏离越大 → 异常越明显</span>
                    </li>
                </ul>

                <p class="help-note">
                    迷你图可快速识别 <strong>对称性缺失、稳定性下降</strong> 以及
                    <strong>康复进步情况</strong>（对比模式下）。
                </p>

                <div class="help-section">
                    <h5>临床解读</h5>
                    <ul class="help-list">
                        <li><strong>功能表现：</strong>速度、步频、步长</li>
                        <li><strong>稳定性：</strong>双支撑、支撑基底</li>
                        <li><strong>协调性：</strong>支撑 ↔ 摆动调节</li>
                        <li><strong>对称性：</strong>双侧比较</li>
                    </ul>
                </div>

                <div class="help-colors">
                    <span class="left-color"></span> 左侧
                    <span class="right-color"></span> 右侧
                </div>

                <div class="help-note">
                    对比模式下：
                    <strong>Δ = 测试2 − 测试1</strong>
                    → 用于量化临床进展。
                </div>
            `,

            pst_radar_intro: `
                <h4>STP 雷达图 — 步态概况</h4>

                <p>用于快速判断：</p>
                <ul class="help-list">
                    <li><strong>左右对称性</strong></li>
                    <li><strong>与标准范围的偏差</strong></li>
                    <li><strong>两次测试变化</strong>（对比模式）</li>
                </ul>

                <p>解读要点：</p>
                <ul class="help-list">
                    <li><strong>灰区内</strong> → 生理正常</li>
                    <li><strong>灰区外</strong> → 性能提升或代偿</li>
                    <li><strong>明显偏低</strong> → 功能受损</li>
                </ul>

                <div class="help-note">
                    康复目标：图形更<strong>圆</strong>、更<strong>大</strong>、更<strong>对称</strong>。
                </div>
            `,

            kinematic_intro: `
                <h4>离散运动学参数</h4>

                <p>来源于运动学曲线，用于总结关节功能：</p>

                <ul class="help-list">
                    <li><strong>角度峰值</strong> — 最大幅度 → 灵活性 / 僵硬程度</li>
                    <li><strong>峰值时序 (%GC)</strong> — 协调能力指标</li>
                    <li><strong>活动范围 (RoM)</strong> — 功能利用程度</li>
                </ul>

                <div class="help-colors">
                    <span class="left-color"></span> 左侧
                    <span class="right-color"></span> 右侧
                </div>

                <p>临床意义：</p>
                <ul class="help-list">
                    <li><strong>RoM 降低</strong> → 活动受限或恐惧负重</li>
                    <li><strong>峰值时序异常</strong> → 神经控制障碍</li>
                    <li><strong>对称性缺失</strong> → 代偿策略</li>
                </ul>

                <div class="help-note">
                    对比模式：Δ (测试2 − 测试1) 用于判断进步或退化。
                </div>
            `
        }


    }
};
