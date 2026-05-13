import { createApp } from "./app/main/create-app";

const app = createApp();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API docs at http://localhost:${port}/docs`);
});
