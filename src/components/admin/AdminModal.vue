<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
const props = defineProps({
  label: { type: String, required: true },
  busy: Boolean,
});
const emit = defineEmits(["close"]);
const dialog = ref(null);
let anterior;
function teclado(event) {
  if (event.key === "Escape" && !props.busy) emit("close");
  if (event.key !== "Tab") return;
  const campos = [
    ...dialog.value.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
    ),
  ];
  const primeiro = campos[0],
    ultimo = campos.at(-1);
  if (
    event.shiftKey &&
    (document.activeElement === primeiro ||
      document.activeElement === dialog.value)
  ) {
    event.preventDefault();
    ultimo?.focus();
  } else if (!event.shiftKey && document.activeElement === ultimo) {
    event.preventDefault();
    primeiro?.focus();
  }
}
onMounted(() => {
  anterior = document.activeElement;
  dialog.value.focus();
  document.addEventListener("keydown", teclado);
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", teclado);
  anterior?.focus();
});
</script>
<template>
  <Teleport to="body"
    ><div
      class="admin-shell admin-modal-backdrop"
      @click.self="!busy && emit('close')"
    >
      <section
        ref="dialog"
        class="admin-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        :aria-busy="busy"
        tabindex="-1"
      >
        <slot />
      </section></div
  ></Teleport>
</template>
