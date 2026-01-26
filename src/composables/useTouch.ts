import { ref } from "vue";

const hasTouch = ref(false);

const checkTouch = () => {
	hasTouch.value = "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
};

checkTouch();

export const useTouch = () => {
	return { hasTouch };
};
