# Instrucciones para desplegar:

El primer paso a realizar tras clonar el repositorio es instalar las dependencias del proyecto utilizando el siguiente comando:

```
pnpm install
```

## Despliegue local

Debemos verificar el archivo handler.js para comprobar que el DynamoDBClient  utilizado en el DynamoDBDocumentClient sea el local; tras verificar, ejecutamos el siguiente comando.

```
serverless offline start
```
