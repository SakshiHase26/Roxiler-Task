import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = "http://localhost:5001/api";

const TransactionDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("march");
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const COLORS = [
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
    "#84CC16",
  ];

  // Fetch transactions from backend
  const fetchTransactions = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/transactions?month=${selectedMonth}&search=${search}&page=${page}&perPage=10`
      );
      const data = await response.json();

      setTransactions(data.data || []);

      const totalPages = data.perPage
        ? Math.ceil(data.total / data.perPage)
        : 1;

      setTotalPages(totalPages);
      setCurrentPage(data.page || page);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    setLoading(false);
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/statistics?month=${selectedMonth}`
      );
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Fetch bar chart data
  const fetchBarChartData = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bar-chart?month=${selectedMonth}`
      );
      const data = await response.json();

      const chartData = Object.entries(data).map(([range, count]) => ({
        range,
        count,
      }));
      setBarChartData(chartData);
    } catch (error) {
      console.error("Error fetching bar chart data:", error);
    }
  };

  // Fetch pie chart data
  const fetchPieChartData = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pie-chart?month=${selectedMonth}`
      );
      const data = await response.json();

      const pieData = data.map((item) => ({
        category: item.category,
        count: item.count,
      }));

      setPieChartData(pieData);
    } catch (error) {
      console.error("Error fetching pie chart data:", error);
    }
  };

  const initializeDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/init`);
      const data = await response.json();
      alert(data.message);
      fetchAllData();
    } catch (error) {
      console.error("Error initializing database:", error);
      alert("Error initializing database");
    }
    setLoading(false);
  };

  const fetchAllData = () => {
    fetchTransactions(1, searchText);
    fetchStatistics();
    fetchBarChartData();
    fetchPieChartData();
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(1);
    setSearchText("");
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setCurrentPage(1);
    fetchTransactions(1, value);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      fetchTransactions(currentPage - 1, searchText);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      fetchTransactions(currentPage + 1, searchText);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Transaction Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and analyze your transaction data with powerful insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Initialize Button */}
              <button
                onClick={initializeDatabase}
                disabled={loading}
                className="group relative inline-flex items-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Initialize Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full sm:w-auto bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month.charAt(0).toUpperCase() + month.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 Search Transactions
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, description, or category..."
                  value={searchText}
                  onChange={handleSearch}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Sales</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${statistics.totalSaleAmount?.toFixed(2) || 0}
                </p>
              </div>
              <div className="text-green-500 opacity-20 group-hover:opacity-30 transition-opacity">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Items Sold</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {statistics.totalSoldItems || 0}
                </p>
              </div>
              <div className="text-blue-500 opacity-20 group-hover:opacity-30 transition-opacity">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Unsold Items</h3>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {statistics.totalNotSoldItems || 0}
                </p>
              </div>
              <div className="text-red-500 opacity-20 group-hover:opacity-30 transition-opacity">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transaction Records
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Showing {transactions.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={transaction.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate font-medium">{transaction.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${transaction.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.sold
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.sold ? "✓ Sold" : "✗ Not Sold"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(transaction.dateOfSale).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Price Range Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barChartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Category Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count, percent }) => `${category}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDashboard;