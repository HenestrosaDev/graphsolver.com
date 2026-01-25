import { createI18n } from "vue-i18n";
import es from "./locales/es";
import en from "./locales/en";

// Definimos el tipo de mensaje para TypeScript (opcional pero recomendado)
type MessageSchema = typeof es;

const i18n = createI18n<[MessageSchema], "es" | "en">({
	legacy: false, // No Composition API
	locale: "es",
	fallbackLocale: "en",
	globalInjection: true,
	messages: {
		es,
		en,
	},
});

export default i18n;
