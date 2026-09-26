const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { db, TABLE } = require("../config/db");
const { respuesta } = require("../utils/response");

module.exports = async (event) => {
  const id = event?.pathParameters?.id;
  if (!id) {
    return respuesta(400, { error: "El parámetro 'id' es requerido" });
  }

  const params = {
    TableName: TABLE,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
  };

  try {
    await db.send(new DeleteCommand(params));
    return respuesta(200, { mensaje: "Cita médica eliminada exitosamente", id });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return respuesta(404, { error: "Cita médica no encontrada" });
    }
    console.error("Error al eliminar cita médica:", err);
    return respuesta(500, { error: "No fue posible eliminar la cita médica" });
  }
};
