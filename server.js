// Import Packages
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");


dotenv.config();

const errorHandler = require("./middlewares/errorHandler.js");

// Import Modules
const connectDB = require("./config/db.js");

// Import Routes
const userRoute = require("./routes/userRoutes.js");
const orderRoute = require("./routes/orderRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js");


const limiter = require("./utils/limiter");


connectDB();
const app = express();



app.use(limiter);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.get("/", (req, res) => {
  res.send("App is running, version: 0.1.2");
});

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}


app.use("/api/users", userRoute);
app.use("/api/orders", orderRoute);
app.use("/api/upload", uploadRoutes);

app.use(errorHandler);


app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Helmet 
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
// app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());


app.listen(
  process.env.PORT || 5000,
  console.log(`Server is running on ${process.env.NODE_ENV} at port ${5000}`)
);

