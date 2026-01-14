const express=require('express');
const mongoose = require('mongoose');
const app=express();
const cors=require('cors')
require("dotenv").config();
const userRoute=require('./routes/userRoute')
const listingRoutes=require('./routes/listingRoute')
const bookingRoutes=require('./routes/bookingRouter')
const reviewRoutes=require('./routes/reviewRoute');
const wishlistRoutes = require("./routes/wishListRoute");
const searchHistoryRoutes = require("./routes/searchHistoryRoute");
const userActivityRoutes = require("./routes/userActivityRoute");
const personalizationRoutes=require('./routes/personalizationRoute')
const searchRoutes = require("./routes/searchRoute");
const metaRoutes = require("./routes/metaRoute");
const profileRoutes=require("./routes/profileRoute");
const hostDashboardRoute=require("./routes/hostDashboardRoute")
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.use('/api/auth',userRoute)
app.use("/api/listings", listingRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/search-history", searchHistoryRoutes);
app.use("/api/activity", userActivityRoutes);
app.use("/api/my",personalizationRoutes)
app.use("/api/search", searchRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/profile",profileRoutes);
app.use("/api/host",hostDashboardRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("Server is Listening at Port", PORT);
});
