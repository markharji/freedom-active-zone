"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, TextField, InputAdornment, Paper, Chip } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import DataTable from "react-data-table-component";
import dayjs from "dayjs";

export default function ReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const [metrics, setMetrics] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* ========================= */
  /* FETCH PAYMENTS */
  /* ========================= */

  const fetchPayments = async () => {
    try {
      setLoading(true);

      let between = "";

      if (startDate && endDate) {
        const start = dayjs(startDate).format("YYYY-MM-DD");

        const end = dayjs(endDate).format("YYYY-MM-DD");

        between = `${start}..${end}`;
      }

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_all_payments",
          dateRange: between,
        }),
      });

      const data = await res.json();
      console.log(data?.payments?.data);
      setPayments(data?.payments?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = async () => {
    try {
      setLoadingMetrics(true);

      let between = "";

      if (startDate && endDate) {
        const start = dayjs(startDate).hour(0).minute(0).format("YYYY-DD-MM HH:mm");

        const end = dayjs(endDate).hour(23).minute(59).format("YYYY-DD-MM HH:mm");

        between = `${start}..${end}`;
      }

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_metrics",
          "created_at.between": between,
        }),
      });

      const data = await res.json();

      setMetrics(data?.metrics || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchPayments();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchPayments();
    getMetrics();
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalTransactions = payments.length;

  const totalThisMonth = payments.filter((p) => dayjs(p.createdAt).isSame(dayjs(), "month")).length;

  /* ========================= */
  /* TABLE COLUMNS */
  /* ========================= */

  const columns = [
    {
      name: "Description",
      selector: (row: any) => row.description,
      cell: (row) => <p className="text-xs">{row.attributes.description}</p>,
      sortable: true,
      grow: 2,
    },
    {
      name: "Amount",
      selector: (row: any) => `₱ ${Number(row.attributes.net_amount / 100).toLocaleString()}`,
      sortable: true,
    },
    {
      name: "Status",
      sortable: true,
      cell: (row: any) => {
        const status = row.attributes.status;

        return (
          <Chip
            label={status}
            size="small"
            sx={{
              fontWeight: 600,
              borderRadius: "8px",
              backgroundColor: status === "paid" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: status === "paid" ? "#16a34a" : "#dc2626",
            }}
          />
        );
      },
    },
    {
      name: "Date",
      selector: (row: any) => dayjs.unix(row.attributes.paid_at).format("YYYY-MM-DD HH:mm:ss"),
      sortable: true,
    },
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <Box
      sx={{
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <div className="flex flex-col flex-wrap md:flex-row  gap-4 mb-4 justify-center">
        <KpiCard
          title="Total Revenue"
          value={`₱ ${metrics.total_revenue_all_time?.toLocaleString()}`}
          icon={<MonetizationOnIcon />}
        />

        <KpiCard title="Total Transactions" value={metrics.total_transactions_all_time} icon={<ReceiptLongIcon />} />

        <KpiCard
          title="Transactions This Month"
          value={metrics.total_transactions_current_month}
          icon={<CalendarMonthIcon />}
        />

        <KpiCard
          title="Revenue This Month"
          value={`₱ ${metrics.total_revenue_current_month?.toLocaleString()}`}
          icon={<CalendarMonthIcon />}
        />
      </div>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={3}>
            <TextField
              type="date"
              label="Start Date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={inputStyle}
              inputProps={{ min: today }}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={3}>
            <TextField
              type="date"
              label="End Date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={inputStyle}
              inputProps={{ min: today }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* DATA TABLE */}
      <Paper
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        <DataTable
          columns={columns}
          data={payments}
          progressPending={loading}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
          customStyles={tableStyles}
        />
      </Paper>
    </Box>
  );
}

/* ========================= */
/* KPI CARD */
/* ========================= */

function KpiCard({ title, value, icon }: { title: string; value: any; icon: any }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: "#ffffff",
        boxShadow: "0 8px 25px rgba(16,23,39,0.08)",
        border: "1px solid #eef1f6",
        width: {
          xs: "100%", // mobile → full width
          md: 220, // desktop → 200px
        },
      }}
    >
      <CardContent sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: "rgba(16,23,39,0.06)",
            color: "#101727",
            display: "flex",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            {title}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#101727" }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ========================= */
/* STYLES */
/* ========================= */

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: 3,
  },
  "& .MuiInputLabel-root": {
    color: "#6b7280",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e5e7eb",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#101727",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#101727",
  },
};

const tableStyles = {
  headRow: {
    style: {
      backgroundColor: "#101727",
      color: "white",
      fontWeight: 600,
      fontSize: "14px",
    },
  },
  rows: {
    style: {
      backgroundColor: "#ffffff",
      color: "#374151",
      borderBottom: "1px solid #f1f5f9",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    },
  },
  pagination: {
    style: {
      backgroundColor: "#ffffff",
      borderTop: "1px solid #e5e7eb",
    },
  },
};
