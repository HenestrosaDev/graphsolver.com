<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import { IconInfoCircle } from '@tabler/icons-vue';

interface Props {
  text: string;
}

const props = defineProps<Props>();
const rootRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null); // Referencia al contenido flotante

const isHoverDevice = ref(true);
const isOpen = ref(false);

// Estado para la posición dinámica
const placement = ref({
  isTop: true,      // ¿Se muestra arriba o abajo?
  xOffset: 0,       // Desplazamiento horizontal (en px) para que no se salga
});

const updateDeviceType = () => {
  const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  isHoverDevice.value = mediaQuery.matches;
  if (isHoverDevice.value) isOpen.value = false;
  return mediaQuery;
};

const handleClickOutside = (event: Event) => {
  if (!isOpen.value) return;
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// --- LÓGICA DE POSICIONAMIENTO ---
const recalculatePosition = async () => {
  if (!rootRef.value || !tooltipRef.value) return;

  // 1. Reseteamos valores para medir correctamente
  placement.value = { isTop: true, xOffset: 0 };
  
  // Esperamos al DOM para que el elemento tenga dimensiones reales
  await nextTick();

  const triggerRect = rootRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const padding = 16; // Margen de seguridad con el borde de la pantalla

  // --- A. Chequeo Vertical ---
  // Si la distancia al techo es menor que la altura del tooltip, invertir a abajo
  // (triggerRect.top es la distancia desde el botón al borde superior de la ventana)
  if (triggerRect.top < tooltipRect.height + padding) {
    placement.value.isTop = false;
  }

  // --- B. Chequeo Horizontal ---
  let offset = 0;
  
  // 1. ¿Se sale por la izquierda?
  if (tooltipRect.left < padding) {
    // Calculamos cuánto hay que empujar a la derecha
    offset = padding - tooltipRect.left;
  } 
  // 2. ¿Se sale por la derecha?
  else if (tooltipRect.right > window.innerWidth - padding) {
    // Calculamos cuánto hay que empujar a la izquierda (valor negativo)
    offset = (window.innerWidth - padding) - tooltipRect.right;
  }

  placement.value.xOffset = offset;
};

// Modificamos el show para que recalcule al abrir
const show = () => {
  isOpen.value = true;
  recalculatePosition();
};

const hide = () => {
  isOpen.value = false;
};

const toggleForTouch = () => {
  if (isHoverDevice.value) return;
  if (!isOpen.value) {
    show(); // Usamos show() para que recalcule
  } else {
    hide();
  }
};

let hoverMediaQuery: MediaQueryList | null = null;

onMounted(() => {
  hoverMediaQuery = updateDeviceType();
  hoverMediaQuery.addEventListener("change", updateDeviceType);
  document.addEventListener("click", handleClickOutside);
  // Escuchar scroll y resize para reajustar si está abierto
  window.addEventListener("scroll", () => isOpen.value && recalculatePosition(), true);
  window.addEventListener("resize", () => isOpen.value && recalculatePosition());
});

onBeforeUnmount(() => {
  if (hoverMediaQuery) hoverMediaQuery.removeEventListener("change", updateDeviceType);
  document.removeEventListener("click", handleClickOutside);
});

const isVisible = computed(() => isOpen.value);
</script>

<template>
  <div ref="rootRef" class="relative inline-flex items-center justify-center">
    <button
      type="button"
      class="text-slate-400 cursor-help hover:text-slate-600 focus:outline-none transition-colors"
      aria-label="Show help tooltip"
      :aria-expanded="isVisible"
      @focus="isHoverDevice && show()"
      @blur="isHoverDevice && hide()"
      @pointerenter="isHoverDevice && show()"
      @pointerleave="isHoverDevice && hide()"
      @click.prevent="toggleForTouch"
    >
      <IconInfoCircle class="pointer-events-none size-3.5" />
    </button>

    <div
      ref="tooltipRef"
      class="absolute left-1/2 mb-2 w-48 z-50 transition-opacity duration-200 ease-in-out pointer-events-none"
      :class="[
        isVisible ? 'visible opacity-100' : 'invisible opacity-0',
        // CLASE DINÁMICA: Si isTop es true usa 'bottom-full', si no, 'top-full' (para ponerlo debajo)
        placement.isTop ? 'bottom-full mb-2' : 'top-full mt-2'
      ]"
      :style="{ 
        // 1. Centramos inicialmente con -50%
        // 2. Sumamos el offset calculado en JS para corregir la posición
        transform: `translateX(calc(-50% + ${placement.xOffset}px))` 
      }"
    >
      <div
        class="bg-slate-800 text-white text-xs rounded py-2 px-3 shadow-xl text-center leading-relaxed relative"
      >
        <span v-html="props.text" />
        
        <div
          class="absolute left-1/2 -translate-x-1/2 border-4 border-transparent"
          :class="[
            // Si el tooltip está arriba, la flecha va abajo (border-t-slate-800)
            // Si el tooltip está abajo, la flecha va arriba (border-b-slate-800)
            placement.isTop 
              ? 'top-full border-t-slate-800' 
              : 'bottom-full border-b-slate-800'
          ]"
          :style="{ 
            // La flecha debe moverse EN CONTRA del contenedor para seguir apuntando al icono
            transform: `translateX(${-placement.xOffset}px)` 
          }"
        />
      </div>
    </div>
  </div>
</template>