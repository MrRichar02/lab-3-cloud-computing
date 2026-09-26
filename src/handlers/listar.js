const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { db, TABLE } = require("../config/db");
const { respuesta } = require("../utils/response");

module.exports = async () => {
  try {
    const { Items } = await db.send(new ScanCommand({ TableName: TABLE }));
    return respuesta(200, Items || []);
  } catch (err) {
    console.error("Error al listar citas médicas:", err);
    return respuesta(500, { error: "No fue posible listar las citas médicas" });
  }
};
