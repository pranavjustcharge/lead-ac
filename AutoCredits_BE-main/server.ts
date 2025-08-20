import "dotenv/config";
import app from "./src/index";
import dbConnection from "./src/config/db";

const port: number = Number(process.env.PORT || 2002);

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is not defined");
}
dbConnection(process.env.DB_URL);

app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

