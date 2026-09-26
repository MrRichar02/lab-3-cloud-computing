const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const TABLE = process.env.CITAS_TABLE || "cloud-computing-lab3-citas-dev";

// Detecta si se está ejecutando en serverless-offline o con un endpoint local configurado
const isOffline =
  process.env.IS_OFFLINE === "true" ||
  process.env.IS_LOCAL === "true" ||
  Boolean(process.env.DYNAMODB_ENDPOINT);

let client;

if (isOffline) {
  client = new DynamoDBClient({
    region: "localhost",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
    credentials: {
      accessKeyId: "MockAccessKeyId",
      secretAccessKey: "MockSecretAccessKey",
    },
  });
} else {
  client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
  });
}

const db = DynamoDBDocumentClient.from(client);

module.exports = {
  db,
  TABLE,
  isOffline,
};
