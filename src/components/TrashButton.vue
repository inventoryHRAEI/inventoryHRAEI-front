<template>
  <button
    class="button"
    :class="{ delete: isDeleting }"
    :aria-label="ariaLabel"
    @click="trigger"
    :disabled="isDeleting || disabled"
  >
    <div class="trash">
      <div class="top">
        <div class="paper"></div>
      </div>
      <div class="box"></div>
    </div>
  </button>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
const props = defineProps({
  duration: { type: Number, default: 1000 },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Eliminar' }
})
const emit = defineEmits(['done'])
const isDeleting = ref(false)
let timer = null

const trigger = (e) => {
  if (isDeleting.value || props.disabled) return
  isDeleting.value = true
  // emit done after animation duration
  timer = setTimeout(() => {
    emit('done')
    isDeleting.value = false
    clearTimeout(timer)
    timer = null
  }, props.duration)
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.button {
  --background: grey;
  --background-hover: #1e2235;
  --shadow: rgba(0, 9, 61, 0.2);
  --paper: #5c86ff;
  --paper-lines: #fff;
  --trash: #e1e6f9;
  --trash-lines: #bbc1e1;

  position: relative;
  border: none;
  outline: none;
  background: none;
  padding: 8px 8px;
  border-radius: 7px;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  background: var(--btn, var(--background));
  box-shadow: 0 var(--shadow-y, 4px) var(--shadow-blur, 8px) var(--shadow);
  transform: scale(var(--scale, 1));
  transition: transform 0.1s, box-shadow 0.1s, background 0.1s;
}

.button .trash {
  display: block;
  position: relative;
  transform: translate(var(--trash-x, 0), var(--trash-y, 1px)) translateZ(0) scale(var(--trash-scale, 0.64));
  transition: transform 0.1s;
}

.button .trash::before,
.button .trash::after {
  content: "";
  position: absolute;
  height: 8px;
  width: 2px;
  border-radius: 1px;
  background: var(--icon, var(--trash));
  bottom: 100%;
  transform-origin: 50% 6px;
  transform: translate(var(--x, 3px), 2px) scaleY(var(--sy, 0.7)) rotate(var(--r, 0deg));
  transition: transform 0.1s, background 0.1s;
}

.button .trash::before { left: 1px; }
.button .trash::after { right: 1px; --x: -3px; }

.button .trash .top {
  position: absolute;
  overflow: hidden;
  left: -4px;
  right: -4px;
  bottom: 100%;
  height: 40px;
  z-index: 1;
  transform: translateY(2px);
}

.button .trash .top::before,
.button .trash .top::after {
  content: "";
  position: absolute;
  border-radius: 1px;
  background: var(--icon, var(--trash));
  width: var(--w, 12px);
  height: var(--h, 2px);
  left: var(--l, 8px);
  bottom: var(--b, 5px);
  transition: background 0.1s, transform 0.1s;
}

.button .trash .top::after { --w: 28px; --h: 2px; --l: 0; --b: 0; transform: scaleX(var(--trash-line-scale, 1)); }

.button .trash .top .paper {
  width: 14px;
  height: 18px;
  background: var(--paper);
  left: 7px;
  bottom: 0;
  border-radius: 1px;
  position: absolute;
  transform: translateY(-16px);
  opacity: 0;
}

.button .trash .top .paper::before,
.button .trash .top .paper::after {
  content: "";
  width: var(--w, 10px);
  height: 2px;
  border-radius: 1px;
  position: absolute;
  left: 2px;
  top: var(--t, 2px);
  background: var(--paper-lines);
  transform: scaleY(0.7);
  box-shadow: 0 9px 0 var(--paper-lines);
}

.button .trash .top .paper::after { --t: 5px; --w: 7px; }

.button .trash .box {
  width: 20px;
  height: 25px;
  border: 2px solid var(--icon, var(--trash));
  border-radius: 1px 1px 4px 4px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  transition: border-color 0.1s;
}

.button .trash .box::before,
.button .trash .box::after {
  content: "";
  position: absolute;
  width: 4px;
  height: var(--h, 20px);
  top: 0;
  left: var(--l, 50%);
  background: var(--b, var(--trash-lines));
}

.button .trash .box::before {
  border-radius: 2px;
  margin-left: -2px;
  transform: translateX(-3px) scale(0.6);
  box-shadow: 10px 0 0 var(--trash-lines);
  opacity: var(--trash-lines-opacity, 1);
}

.button .trash .box::after {
  --h: 16px;
  --b: var(--paper);
  --l: 1px;
  transform: translate(-0.5px, -16px) scaleX(0.5);
  box-shadow: 7px 0 0 var(--paper), 14px 0 0 var(--paper), 21px 0 0 var(--paper);
}

.button.delete { --span-opacity: 0; --span-x: 16px; --trash-x: 0px; --trash-y: 2px; --trash-scale: 1; --trash-lines-opacity: 0; --trash-line-scale: 0; --icon: #fff; }

.button.delete .trash::before,
.button.delete .trash::after { --sy: 1; --x: 0; }

.button.delete .trash::before { --r: 10deg; }
.button.delete .trash::after { --r: -10deg; }

.button.delete .trash .top .paper { animation: paper 1s linear forwards 0.1s; }

.button.delete,
.button:hover { --btn: var(--background-hover); --shadow-y: 5px; --shadow-blur: 9px; }

.button:active { --shadow-y: 2px; --shadow-blur: 5px; --scale: 0.94; }

@keyframes paper {
  10%,
  100% { opacity: 1; }
  20% { transform: translateY(-16px); }
  40% { transform: translateY(0); }
  70%,
  100% { transform: translateY(24px); }
}
</style>