const fs = require('fs');

const path = 'src/components/BiomedicalEquipmentTable.vue';
let content = fs.readFileSync(path, 'utf8');

// The block we want to replace
const target = `/* 🔴 ROJO OSCURO - CRÍTICO (No funcional + MC activo o Condiciones Malas) */
.status-critical,
.status-non-functional,
.status-poor-condition {
  background: rgba(220, 38, 38, 0.2);
  color: #fecaca;
  border: 1px solid rgba(220, 38, 38, 0.3);
  padding-left: 12px;
}

.status-critical::before,
.status-non-functional::before,
.status-poor-condition::before {
  background: #dc2626;
}

/*  MORADO - MANTENIMIENTO CORRECTIVO */
.status-warning,
.status-corrective_maintenance,
.status-corrective {
  background: rgba(139, 92, 246, 0.2);
  color: #ddd6fe;
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding-left: 12px;
}

.status-warning::before,
.status-corrective_maintenance::before,
.status-corrective::before {
  background: #8b5cf6;
}

/* 🟪 LILA - MANTENIMIENTO PREVENTIVO */
.status-in-progress,
.status-in_maintenance,
.status-preventive_maintenance,
.status-preventive {
  background: rgba(167, 139, 250, 0.2);
  color: #e9d5ff;
  border: 1px solid rgba(167, 139, 250, 0.3);
  padding-left: 12px;
}

.status-in-progress::before,
.status-in_maintenance::before,
.status-preventive_maintenance::before,
.status-preventive::before {
  background: #a78bfa;
}

/* 🟠 NARANJA - CONDICIONES REGULARES */
.status-regular-condition,
.status-regular {
  background: rgba(251, 146, 60, 0.2);
  color: #fed7aa;
  border: 1px solid rgba(251, 146, 60, 0.3);
  padding-left: 12px;
}

.status-regular-condition::before,
.status-regular::before {
  background: #fb923c;
}

/* ⚪ GRIS - FUERA DE SERVICIO */
.status-offline {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
  padding-left: 12px;
}

.status-offline::before {
  background: #64748b;
}

/* 🟢 VERDE - OPERATIVO */
.status-operational {
  background: rgba(34, 197, 94, 0.2);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding-left: 12px;
}

.status-operational::before {
  background: #22c55e;
}

/* ✨ VERDE BRILLANTE - EXCELENTE (Funcional + Condiciones Buenas) */
.status-excellent {
  background: rgba(16, 185, 129, 0.25);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding-left: 12px;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}

.status-excellent::before {
  background: #10b981;
}`;

const replacement = `/* 🔴 ROJO OSCURO - CRÍTICO (No funcional + MC activo o Condiciones Malas) */
.status-critical,
.status-non-functional,
.status-poor-condition {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-critical::before,
.status-non-functional::before,
.status-poor-condition::before {
  display: none;
}

/*  MORADO - MANTENIMIENTO CORRECTIVO */
.status-warning,
.status-corrective_maintenance,
.status-corrective {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-warning::before,
.status-corrective_maintenance::before,
.status-corrective::before {
  display: none;
}

/* 🟪 LILA - MANTENIMIENTO PREVENTIVO */
.status-in-progress,
.status-in_maintenance,
.status-preventive_maintenance,
.status-preventive {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-in-progress::before,
.status-in_maintenance::before,
.status-preventive_maintenance::before,
.status-preventive::before {
  display: none;
}

/* 🟠 NARANJA - CONDICIONES REGULARES / PARTIAL */
.status-partial,
.status-regular-condition,
.status-regular {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-partial::before,
.status-regular-condition::before,
.status-regular::before {
  display: none;
}

/* 🍅 NARANJA OSCURO - REQUIERE ATENCIÓN */
.status-attention {
  background: linear-gradient(135deg, #f97316 0%, #c2410c 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-attention::before {
  display: none;
}

/* ⚪ GRIS - FUERA DE SERVICIO */
.status-unknown,
.status-retired,
.status-offline {
  background: linear-gradient(135deg, #9ca3af 0%, #4b5563 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-unknown::before,
.status-retired::before,
.status-offline::before {
  display: none;
}

/* 🟢 VERDE - OPERATIVO */
.status-available,
.status-operational {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-available::before,
.status-operational::before {
  display: none;
}

/* ✨ VERDE BRILLANTE - EXCELENTE (Funcional + Condiciones Buenas) */
.status-excellent {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  padding-left: 12px;
}

.status-excellent::before {
  display: none;
}`;

// Fix newlines to match what is in the file just in case
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (content.includes(normTarget)) {
  content = content.replace(normTarget, normReplacement);
} else if (content.includes(target)) {
  content = content.replace(target, replacement);
} else {
  // If neither matched exactly, use regex to tolerate \r\n differences
  const regex = new RegExp(target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n'), 'g');
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
  } else {
    console.error("Target content not found in the file!");
    process.exit(1);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log("Success");
