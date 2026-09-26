const http = require("http");
const url = require("url");
const newman = require("newman");
const { db } = require("../src/config/db");
const handler = require("../handler");

// Emulación en memoria de DynamoDB para pruebas completas y aisladas
const inMemoryStore = new Map();

db.send = async (command) => {
  const name = command.constructor.name;
  const input = command.input;

  if (name === "PutCommand") {
    inMemoryStore.set(input.Item.id, { ...input.Item });
    return {};
  }

  if (name === "ScanCommand") {
    return { Items: Array.from(inMemoryStore.values()) };
  }

  if (name === "GetCommand") {
    const item = inMemoryStore.get(input.Key.id);
    return { Item: item ? { ...item } : null };
  }

  if (name === "UpdateCommand") {
    const existing = inMemoryStore.get(input.Key.id);
    if (!existing) {
      const err = new Error("Conditional check failed");
      err.name = "ConditionalCheckFailedException";
      throw err;
    }
    const updated = {
      ...existing,
      paciente: input.ExpressionAttributeValues[":paciente"],
      medico: input.ExpressionAttributeValues[":medico"],
      especialidad: input.ExpressionAttributeValues[":especialidad"],
      fecha: input.ExpressionAttributeValues[":fecha"],
      estado: input.ExpressionAttributeValues[":estado"],
      motivo: input.ExpressionAttributeValues[":motivo"],
      actualizadoEn: input.ExpressionAttributeValues[":actualizadoEn"],
    };
    inMemoryStore.set(input.Key.id, updated);
    return { Attributes: updated };
  }

  if (name === "DeleteCommand") {
    if (!inMemoryStore.has(input.Key.id)) {
      const err = new Error("Conditional check failed");
      err.name = "ConditionalCheckFailedException";
      throw err;
    }
    inMemoryStore.delete(input.Key.id);
    return {};
  }

  throw new Error(`Command ${name} no soportado en test`);
};

// Servidor HTTP emulador de API Gateway
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    let result = { statusCode: 404, body: JSON.stringify({ error: "Ruta no encontrada" }) };

    try {
      if (pathname === "/citas" && method === "POST") {
        result = await handler.crear({ body });
      } else if (pathname === "/citas" && method === "GET") {
        result = await handler.listar({});
      } else if (pathname.startsWith("/citas/") && method === "GET") {
        const id = pathname.replace("/citas/", "");
        result = await handler.obtener({ pathParameters: { id } });
      } else if (pathname.startsWith("/citas/") && method === "PUT") {
        const id = pathname.replace("/citas/", "");
        result = await handler.actualizar({ pathParameters: { id }, body });
      } else if (pathname.startsWith("/citas/") && method === "DELETE") {
        const id = pathname.replace("/citas/", "");
        result = await handler.eliminar({ pathParameters: { id } });
      }
    } catch (err) {
      console.error("Error en handler:", err);
      result = { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }

    res.writeHead(result.statusCode, {
      "Content-Type": "application/json",
      ...(result.headers || {}),
    });
    res.end(result.body);
  });
});

const PORT = 3099;
server.listen(PORT, () => {
  console.log(`Servidor de pruebas iniciado en http://localhost:${PORT}`);

  newman.run(
    {
      collection: require("../citas_medicas.postman_collection.json"),
      environment: {
        values: [
          { key: "baseUrl", value: `http://localhost:${PORT}`, enabled: true },
        ],
      },
      reporters: "cli",
    },
    (err, summary) => {
      server.close(() => {
        if (err || summary.run.failures.length > 0) {
          console.error("Fueron encontradas fallas en la ejecución de Postman.");
          process.exit(1);
        } else {
          console.log("\n Todas las pruebas de Postman se ejecutaron exitosamente!");
          process.exit(0);
        }
      });
    }
  );
});
