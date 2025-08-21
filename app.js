require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");
const getUser = require("./middleware/getUser");
const path = require("path");
const User = require("./models/User"); // Add this at the top with other requires


const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
// Serve uploads directory as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(getUser);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", async (req, res) => {
  let user = null;
  if (req.user && req.user.userId) {
    user = await User.findById(req.user.userId);
  }
  res.render("index", { title: "Home", user: user || null });
});

app.get("/about", (req, res) => {
  res.render("about", { user: req.user || null });
});

app.get("/login", (req, res) =>
  res.render("login", { user: req.user || null })
);
app.get("/register", (req, res) =>
  res.render("register", { user: req.user || null })
);
app.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user && req.user.userId ? req.user.userId : null;
    if (!userId) {
      return res.redirect("/login");
    }
    // Populate vaultDocs and applications for the user
    const BusinessApplication = require("./models/BusinessApplication");
    const LoanApplication = require("./models/LoanApplication");
    const VehicleRegistration = require("./models/VehicleRegistration");
    const user = await User.findById(userId)
      .populate("vaultDocs")
      .populate("applications");
    if (!user) {
      return res.redirect("/login");
    }
    // Fetch all business, loan, and vehicle applications for this user
    const businessApplications = await BusinessApplication.find({ user: userId });
    const loanApplications = await LoanApplication.find({ user: userId });
    const vehicleRegistrations = await VehicleRegistration.find({ user: userId });
    user.firstName = req.user.firstName;
    user.lastName = req.user.lastName;
    res.render("dashboard", {
      user: user,
      username: user.username || "User",
      vaultDocs: user.vaultDocs || [],
      applications: user.applications || [],
      businessApplications,
      loanApplications,
      vehicleRegistrations
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error loading dashboard");
  }
});

app.get("/approval", auth, (req, res) => {
  const approvalLevel =
    req.user && typeof req.user.approvalLevel === "number"
      ? req.user.approvalLevel
      : 0;
  res.json({ approvalLevel, user: req.user || null });
});

const meetingsRoutes = require("./routes/meetings");
const adminRoutes = require("./routes/admin");
const spendingsRoutes = require("./routes/spendings");
const vaultRoutes = require("./routes/vault");
const applicationRoutes = require("./routes/application");
const adminApprovalRoutes = require("./routes/admin-approval");
const raiseInMeetingRoutes = require("./routes/raise-in-meeting");
const wowUpRoutes = require("./routes/wowUp");
const townhallRoutes = require("./routes/townhall");
app.use("/", authRoutes);
app.use("/", meetingsRoutes);
app.use("/", adminRoutes);
app.use("/", adminApprovalRoutes);
app.use("/", spendingsRoutes);
app.use("/", vaultRoutes);
app.use("/", applicationRoutes);
app.use("/wowUp", wowUpRoutes);
app.use("/raise-in-meeting", raiseInMeetingRoutes);
app.use("/townhall", townhallRoutes);


// --- Socket.IO for townhall chat ---
const Message = require('./models/Message');
io.on('connection', (socket) => {
  // No authentication here; rely on POST for persistence
  socket.on('chat message', async (text) => {
    // No user context on socket, so skip persistence here
    // Real persistence is handled in POST /townhall/message
    // This is just for real-time broadcast
    // The server will emit to all clients when a message is saved
  });
});

// Expose io to routes
app.set('io', io);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
