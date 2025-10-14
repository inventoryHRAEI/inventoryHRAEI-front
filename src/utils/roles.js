export function formatRole(role){
  if (!role) return 'Usuario'
  const r = String(role).toLowerCase()
  if (r === 'admin') return 'Administrador'
  if (r === 'privileged') return 'Con privilegios'
  return 'Usuario'
}

export function actionLabelFor(role){
  const r = String(role).toLowerCase()
  if (r === 'admin') return 'Revertir a usuario'
  return 'Convertir en administrador'
}
