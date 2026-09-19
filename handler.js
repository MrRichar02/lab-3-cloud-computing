const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb")
const { randomUUID } = require("crypto")

const TABLE = process.env.PRODUCTOS_TABLE
const db = DynamoDBDocumentClient.from(new DynamoDBClient())

const respuesta = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

const leerBody = (event) => {
  try {
    return JSON.parse(event.body || "{}")
  } catch {
    return null
  }
}

const validar = (data) => {
  if (!data) return "El cuerpo debe ser un JSON válido"
  if (typeof data.nombre !== "string" || !data.nombre.trim())
    return '"nombre" es obligatorio y debe ser texto'
  if (typeof data.precio !== "number" || data.precio < 0)
    return '"precio" es obligatorio y debe ser un número >= 0'
  if (data.stock !== undefined && !Number.isInteger(data.stock))
    return '"stock" debe ser un número entero'
  return null
}

// CREATE - POST /productos 
module.exports.crear = async (event) => {
  const data = leerBody(event)
  const error = validar(data)
  if (error) return respuesta(400, { error })
  const item = {
    id: randomUUID(),
    nombre: data.nombre,
    precio: data.precio,
    stock: data.stock ?? 0,
    creadoEn: new Date().toISOString(),
  }
  try {
    await db.send(new PutCommand({ TableName: TABLE, Item: item }))
    return respuesta(201, item)
  } catch (err) {
    console.error(err)
    return respuesta(500, { error: "No fue posible crear el producto" })
  }
}

// READ (todos) - GET /productos 
module.exports.listar = async () => {
  try {
    const { Items } = await db.send(new ScanCommand({ TableName: TABLE }))
    return respuesta(200, Items)
  } catch (err) {
    console.error(err)
    return respuesta(500, { error: "No fue posible listar los productos" })
  }
}

// READ (uno) - GET /productos/{id} 
module.exports.obtener = async (event) => {
  const { id } = event.pathParameters
  try {
    const { Item } = await db.send(
      new GetCommand({ TableName: TABLE, Key: { id } })
    )
    if (!Item) return respuesta(404, { error: "Producto no encontrado" })
    return respuesta(200, Item)
  } catch (err) {
    console.error(err)
    return respuesta(500, { error: "No fue posible consultar el producto" })
  }
}
