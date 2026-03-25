import app from "./app.js";

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ API running on http://localhost:${port}`);
  console.log(`🗄️ DB target: ${process.env.DB_NAME || "(missing DB_NAME)"}`);
});
