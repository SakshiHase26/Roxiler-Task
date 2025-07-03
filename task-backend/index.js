// Load environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const Transaction = require("./models/Transaction");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ Mongo connection failed:", err));

// ---------- API TO SEED DATABASE ----------
app.get("/api/init", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const transformed = response.data.map(item => ({
      ...item,
      dateOfSale: new Date(item.dateOfSale)
    }));

    await Transaction.deleteMany({});
    await Transaction.insertMany(transformed);
    res.json({ message: "✅ Database seeded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to seed database" });
  }
});

// ---------- GET TRANSACTIONS ----------
app.get("/api/transactions", async (req, res) => {
  try {
    const { month = "March", search = "", page = 1, perPage = 10 } = req.query;
    const regex = new RegExp(search, "i");
    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;

    const filter = {
      dateOfSale: { $exists: true },
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
      $or: [
        { title: regex },
        { description: regex },
        { category: regex },
      ]
    };

    const transactions = await Transaction.find(filter)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    const total = await Transaction.countDocuments(filter);

    res.json({
      data: transactions,
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to fetch transactions" });
  }
});

// ---------- STATISTICS ----------
app.get("/api/statistics", async (req, res) => {
  try {
    const { month = "March" } = req.query;
    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;

    const soldStats = await Transaction.aggregate([
      {
        $match: {
          sold: true,
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
        },
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
    ]);

    const unsoldCount = await Transaction.countDocuments({
      sold: false,
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    });

    res.json({
      totalSaleAmount: soldStats[0]?.totalSaleAmount || 0,
      totalSoldItems: soldStats[0]?.count || 0,
      totalNotSoldItems: unsoldCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to fetch statistics" });
  }
});

// ---------- BAR CHART ----------
app.get("/api/bar-chart", async (req, res) => {
  try {
    const { month = "March" } = req.query;
    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;

    const priceRanges = [
      [0, 100], [101, 200], [201, 300], [301, 400], [401, 500],
      [501, 600], [601, 700], [701, 800], [801, 900], [901, Infinity]
    ];

    const counts = {};

    for (const [min, max] of priceRanges) {
      const count = await Transaction.countDocuments({
        price: {
          $gte: min,
          ...(max !== Infinity && { $lte: max }),
        },
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
      });

      const label = `${min}-${max === Infinity ? "above" : max}`;
      counts[label] = count;
    }

    res.json(counts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to fetch bar chart data" });
  }
});

// ---------- PIE CHART ----------
app.get("/api/pie-chart", async (req, res) => {
  try {
    const { month = "March" } = req.query;
    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;

    const result = await Transaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(result.map(item => ({
      category: item._id,
      count: item.count,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to fetch pie chart data" });
  }
});

// ---------- DASHBOARD ----------
app.get("/api/dashboard", async (req, res) => {
  try {
    const { month = "March" } = req.query;
    const base = `http://localhost:${process.env.PORT || 5001}/api`;

    const [
      transactionsRes,
      statisticsRes,
      barChartRes,
      pieChartRes
    ] = await Promise.all([
      axios.get(`${base}/transactions?month=${month}`),
      axios.get(`${base}/statistics?month=${month}`),
      axios.get(`${base}/bar-chart?month=${month}`),
      axios.get(`${base}/pie-chart?month=${month}`),
    ]);

    res.json({
      transactions: transactionsRes.data,
      statistics: statisticsRes.data,
      barChart: barChartRes.data,
      pieChart: pieChartRes.data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to fetch dashboard data" });
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
