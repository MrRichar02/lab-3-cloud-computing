const respuesta = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    ...headers,
  },
  body: JSON.stringify(body),
});

module.exports = { respuesta };
