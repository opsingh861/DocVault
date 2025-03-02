import app from "./config/app.js";
import { connectDB } from "./src/utils/database.js";

app.get('/', (req, res) => {
    res.send('Hello World');
});

const PORT = process.env.SERVER_PORT ;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('🚀 Server running on port 3000');
    });
});
