const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
const { db, TABLE } = require("../config/db");
const { respuesta } = require("../utils/response");
const { leerBody, validarCita } = require("../utils/validator");

module.exports = async (event) => {
  const data = leerBody(event);
  const error = validarCita(data);
  if (error) {
    return respuesta(400, { error });
  }

  const timestamp = new Date().toISOString();
  const item = {
    id: randomUUID(),
    paciente: data.paciente.trim(),
    medico: data.medico.trim(),
    especialidad: data.especialidad.trim(),
    fecha: data.fecha.trim(),
    estado: data.estado ? data.estado.toUpperCase() : "PROGRAMADA",
    motivo: data.motivo ? data.motivo.trim() : "",
    creadoEn: timestamp,
    actualizadoEn: timestamp,
  };

  try {
    await db.send(new PutCommand({ TableName: TABLE, Item: item }));
    return respuesta(201, item);
  } catch (err) {
    console.error("Error al crear cita médica:", err);
    return respuesta(500, { error: "No fue posible agendar la cita médica" });
  }
};
