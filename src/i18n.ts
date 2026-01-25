import { createI18n } from "vue-i18n";
import es from "./locales/es";
import en from "./locales/en";

type MessageSchema = typeof es;

const i18n = createI18n<[MessageSchema], "es" | "en">({
	legacy: false, // No Composition API
	locale: "en",
	fallbackLocale: "en",
	globalInjection: true,
	messages: {
		es,
		en,
	},
});

export default i18n;
