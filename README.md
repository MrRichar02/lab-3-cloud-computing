# API Serverless de Citas Médicas - Laboratorio 3

API RESTful serverless para la gestión de **Citas Médicas**, desarrollada con **Serverless Framework**, **Node.js** y **AWS DynamoDB**.

---

## 📋 Entidad: Cita Médica

| Atributo | Tipo | Descripción | Obligatorio |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Identificador único (Partition Key) | Generado automáticamente |
| `paciente` | String | Nombre del paciente | Sí |
| `medico` | String | Nombre del médico | Sí |
| `especialidad` | String | Especialidad médica | Sí |
| `fecha` | String | Fecha y hora de la cita | Sí |
| `estado` | String | `PROGRAMADA`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA` | No (Default: `PROGRAMADA`) |
| `motivo` | String | Motivo de la consulta | No (Default: `""`) |
| `creadoEn` | String (ISO) | Fecha de registro inicial | Generado automáticamente |
| `actualizadoEn` | String (ISO) | Fecha de última modificación | Generado automáticamente |

---

## 📁 Estructura Modular

```text
├── .env.example                            # Plantilla de variables de entorno
├── citas_medicas.postman_collection.json   # Colección de Postman con pruebas automatizadas
├── handler.js                              # Punto de entrada y re-exportador de funciones
├── serverless.yml                          # Definición de infraestructura AWS (Lambda, DynamoDB, HTTP API)
├── package.json                            # Scripts de NPM y dependencias del proyecto
├── scripts/
│   └── test-postman.js                     # Runner automatizado con Newman
└── src/
    ├── config/
    │   └── db.js                           # Cliente DynamoDB con detección dinámica (Local vs AWS)
    ├── utils/
    │   ├── response.js                     # Generador de respuestas HTTP y CORS
    │   └── validator.js                    # Validaciones de carga útil y campos
    └── handlers/
        ├── crear.js                        # POST /citas (201 Created)
        ├── listar.js                       # GET /citas (200 OK)
        ├── obtener.js                      # GET /citas/{id} (200 OK / 404 Not Found)
        ├── actualizar.js                   # PUT /citas/{id} (200 OK / 404 Not Found)
        └── eliminar.js                     # DELETE /citas/{id} (200 OK / 404 Not Found)
```

---

## 🚀 Instalación y Despliegue

### 1. Instalación de Dependencias

```bash
npm install
# o con pnpm:
pnpm install
```

### 2. Ejecución Local (Serverless Offline)

Para levantar el servidor HTTP local y la base de datos DynamoDB:

```bash
npx serverless offline start
```

El servicio quedará disponible en `http://localhost:3000`.

### 3. Despliegue en AWS

Para desplegar en tu cuenta de AWS:

```bash
npx serverless deploy
```

Al finalizar el despliegue, Serverless imprimirá en consola el endpoint base de la HTTP API (ej. `https://xxxxxx.execute-api.us-east-1.amazonaws.com`).

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto incluye la colección [`citas_medicas.postman_collection.json`](./citas_medicas.postman_collection.json) con **9 casos de prueba y 18 aserciones automatizadas** (`pm.test`).

### Detalle de las Pruebas Incluidas:
1. `POST /citas`: Creación exitosa (`201 Created`) y guardado dinámico de variable `citaId`.
2. `POST /citas`: Validación de datos requeridos (`400 Bad Request`).
3. `GET /citas`: Listado general de citas (`200 OK`).
4. `GET /citas/{{citaId}}`: Consulta por ID de la cita creada (`200 OK`).
5. `GET /citas/0000...`: Consulta con ID inexistente (`404 Not Found`).
6. `PUT /citas/{{citaId}}`: Actualización a estado `CONFIRMADA` con `ReturnValues: ALL_NEW` (`200 OK`).
7. `PUT /citas/0000...`: Actualización de cita inexistente con `ConditionExpression` (`404 Not Found`).
8. `DELETE /citas/{{citaId}}`: Eliminación con `ConditionExpression` (`200 OK`).
9. `DELETE /citas/{{citaId}}`: Verificación de borrado previo intentando re-eliminar (`404 Not Found`).

---

### Opción A: Ejecución Rápida con NPM (Recomendada)

Ejecuta todas las pruebas de Postman de forma autónoma con un solo comando:

```bash
npm test
```

Este script inicia un entorno de pruebas, ejecuta la colección mediante **Newman** y muestra el reporte detallado en la terminal.

---

### Opción B: Ejecución con Newman apuntando a un Entorno Específico

* **Contra entorno Local (`serverless offline` en ejecución):**
  ```bash
  npx newman run citas_medicas.postman_collection.json --env-var baseUrl=http://localhost:3000
  ```

* **Contra entorno de Producción en AWS:**
  ```bash
  npx newman run citas_medicas.postman_collection.json --env-var baseUrl=https://<TU-API-ID>.execute-api.us-east-1.amazonaws.com
  ```

---

### Opción C: Ejecución desde la Interfaz de Postman

1. Abre **Postman** e importa el archivo `citas_medicas.postman_collection.json`.
2. En la pestaña **Variables** de la colección:
   - Configura `baseUrl` con `http://localhost:3000` (Local) o la URL de AWS API Gateway.
3. Haz clic derecho sobre la colección y selecciona **Run collection** (Collection Runner).
4. Presiona **Run API Citas Médicas**.
5. Verifica que las 18 aserciones se marquen en verde (Passed).
