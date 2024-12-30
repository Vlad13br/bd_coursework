const express = require("express");
const session = require("express-session");
const cors = require("cors");
const router = require("./routes/auth-router");
const watcherRouter = require("./routes/watcher-router");
const profileRouter = require("./routes/profile-router");
const adminRouter = require('./routes/stats-router')
const reviewsRouter = require('./routes/reviews-router')
const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE, PATCH',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}));
app.use(
    session({
        secret: "ssecret-key",
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000,
        },
    })
);

app.use(express.json());
app.use("/api", router);
app.use("/api", watcherRouter)
app.use("/api", profileRouter)
app.use("/api", adminRouter)
app.use('/api',reviewsRouter)

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
