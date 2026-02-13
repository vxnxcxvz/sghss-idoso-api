const { app } = require('./app');

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`Swagger em http://localhost:${port}/docs`);
});
