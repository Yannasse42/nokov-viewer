let currentLang = "fr";

function t(key) {
    if (!key || typeof key !== "string") return key;

    const dict = translations[currentLang];
    if (!dict) return key;

    const parts = key.split(".");
    let result = dict;

    for (const p of parts) {
        if (result && typeof result === "object" && p in result) {
            result = result[p];
        } else {
            return key; // Évite l’erreur et retourne la clé brute
        }
    }

    return result;
}

function applyTranslations(lang) {
    currentLang = lang;

    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const translated = t(key);
        el.textContent = translated;
    });
}
