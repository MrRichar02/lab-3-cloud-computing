const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { db, TABLE } = require("../config/db");
const { respuesta } = require("../utils/response");

module.exports = async (event) => {
  const id = event?.pathParameters?.id;
  if (!id) {
    return respuesta(400, { error: "El parámetro 'id' es requerido" });
  }

  try {
    const { Item } = await db.send(
      new GetCommand({ TableName: TABLE, Key: { id } })
    );
    if (!Item) {
      return respuesta(404, { error: "Cita médica no encontrada" });
    }
    return respuesta(200, Item);
  } catch (err) {
    console.error("Error al consultar cita médica:", err);
    return respuesta(500, { error: "No fue posible consultar la cita médica" });
  }
};
