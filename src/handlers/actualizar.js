const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { db, TABLE } = require("../config/db");
const { respuesta } = require("../utils/response");
const { leerBody, validarCita } = require("../utils/validator");

module.exports = async (event) => {
  const id = event?.pathParameters?.id;
  if (!id) {
    return respuesta(400, { error: "El parámetro 'id' es requerido" });
  }

  const data = leerBody(event);
  const error = validarCita(data);
  if (error) {
    return respuesta(400, { error });
  }

  const timestamp = new Date().toISOString();

  const params = {
    TableName: TABLE,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    UpdateExpression:
      "SET #paciente = :paciente, #medico = :medico, #especialidad = :especialidad, #fecha = :fecha, #estado = :estado, #motivo = :motivo, #actualizadoEn = :actualizadoEn",
    ExpressionAttributeNames: {
      "#paciente": "paciente",
      "#medico": "medico",
      "#especialidad": "especialidad",
      "#fecha": "fecha",
      "#estado": "estado",
      "#motivo": "motivo",
      "#actualizadoEn": "actualizadoEn",
    },
    ExpressionAttributeValues: {
      ":paciente": data.paciente.trim(),
      ":medico": data.medico.trim(),
      ":especialidad": data.especialidad.trim(),
      ":fecha": data.fecha.trim(),
      ":estado": data.estado ? data.estado.toUpperCase() : "PROGRAMADA",
      ":motivo": data.motivo ? data.motivo.trim() : "",
      ":actualizadoEn": timestamp,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const { Attributes } = await db.send(new UpdateCommand(params));
    return respuesta(200, Attributes);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return respuesta(404, { error: "Cita médica no encontrada" });
    }
    console.error("Error al actualizar cita médica:", err);
    return respuesta(500, { error: "No fue posible actualizar la cita médica" });
  }
};
