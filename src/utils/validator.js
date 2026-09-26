const ESTADOS_VALIDOS = ["PROGRAMADA", "CONFIRMADA", "CANCELADA", "COMPLETADA"];

const leerBody = (event) => {
  try {
    if (!event || event.body === undefined || event.body === null) {
      return {};
    }
    if (typeof event.body === "object") {
      return event.body;
    }
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
};

const validarCita = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "El cuerpo debe ser un JSON válido";
  }
  if (typeof data.paciente !== "string" || !data.paciente.trim()) {
    return '"paciente" es obligatorio y debe ser texto';
  }
  if (typeof data.medico !== "string" || !data.medico.trim()) {
    return '"medico" es obligatorio y debe ser texto';
  }
  if (typeof data.especialidad !== "string" || !data.especialidad.trim()) {
    return '"especialidad" es obligatorio y debe ser texto';
  }
  if (typeof data.fecha !== "string" || !data.fecha.trim()) {
    return '"fecha" es obligatorio y debe ser texto (formato ISO o YYYY-MM-DD HH:mm)';
  }
  if (data.estado !== undefined) {
    if (
      typeof data.estado !== "string" ||
      !ESTADOS_VALIDOS.includes(data.estado.toUpperCase())
    ) {
      return `"estado" debe ser uno de los siguientes: ${ESTADOS_VALIDOS.join(", ")}`;
    }
  }
  if (data.motivo !== undefined && typeof data.motivo !== "string") {
    return '"motivo" debe ser texto';
  }
  return null;
};

module.exports = {
  ESTADOS_VALIDOS,
  leerBody,
  validarCita,
};
