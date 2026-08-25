import { createApp } from "./src/app.js";

// Read listening port from environment or fallback to default 4000
const PORT = process.env.PORT || 4000;

// Initialize the configured NodeFrame application
const app = createApp();

// Start HTTP server listener
const server = app.listen(PORT, () => {
  console.log(`DevKit API is running at http://localhost:${PORT}`);
});

export default server;
