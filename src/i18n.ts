import { createI18n } from "vue-i18n";
import es from "./locales/es";
import en from "./locales/en";

type MessageSchema = typeof es;

// Detect user language
const userLanguage = navigator.language.startsWith("es") ? "es" : "en";

const i18n = createI18n<[MessageSchema], "es" | "en">({
	legacy: false, // No Composition API
	locale: userLanguage,
	fallbackLocale: "en",
	globalInjection: true,
	messages: {
		es,
		en,
	},
});

export default i18n;
