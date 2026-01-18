"use client";

import { useState } from "react";
import DataTable from "react-data-table-component";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Stack, Button, Chip, Box } from "@mui/material";
import { customStyles } from "./ApparelTransactionsTable";
import toast from "react-hot-toast";

interface Props {
  data: any[];
  onTransactionUpdated?: () => void; // optional callback to refresh table
}

export default function FacilityTransactionsTable({ data, fetchFacilityTransactions }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRowClick = (row: any) => {
    setSelectedTransaction(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTransaction(null);
  };

  const handleCancelClick = (transaction: any) => {
    setTransactionToCancel(transaction);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setTransactionToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!transactionToCancel) return;

    setLoadingId(transactionToCancel._id);

    try {
      const res = await fetch("/api/facility-transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: transactionToCancel._id, status: "cancelled" }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to cancel transaction");

      toast.success("Transaction cancelled successfully!");
      fetchFacilityTransactions();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel transaction");
    } finally {
      setLoadingId(null);
      handleCancelDialogClose();
    }
  };

  const columns = [
    { name: "Customer Name", selector: (row: any) => row.userName, sortable: true },
    { name: "Email", selector: (row: any) => row.userEmail },
    { name: "Contact", selector: (row: any) => row.userContact },
    { name: "Facility", selector: (row: any) => row.facility?.name },
    { name: "Date", selector: (row: any) => row.date },
    { name: "Start Time", selector: (row: any) => row.startTime },
    { name: "End Time", selector: (row: any) => row.endTime },
    { name: "Price", selector: (row: any) => `₱${row.price}` },
    {
      name: "Status",
      selector: (row: any) => row.status,
      cell: (row: any) => (
        <Chip
          label={row.status}
          color={row.status === "Completed" ? "success" : row.status === "pending" ? "warning" : "error"}
          size="small"
        />
      ),
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Button
          variant="contained"
          color="error"
          size="small"
          disabled={row.status === "cancelled" || loadingId === row._id}
          onClick={() => handleCancelClick(row)}
        >
          {loadingId === row._id ? "Cancelling..." : "Cancel"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        striped
        customStyles={customStyles}
        onRowClicked={handleRowClick}
      />

      {/* Transaction Details Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold", fontSize: 22 }}>Transaction Details</DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Stack spacing={2} sx={{ fontFamily: "'Roboto', sans-serif" }}>
              {[
                { label: "Customer Name", value: selectedTransaction.userName },
                { label: "Email", value: selectedTransaction.userEmail },
                { label: "Contact", value: selectedTransaction.userContact },
                { label: "Facility", value: selectedTransaction.facility?.name },
                { label: "Date", value: selectedTransaction.date },
                { label: "Time", value: `${selectedTransaction.startTime} - ${selectedTransaction.endTime}` },
                { label: "Price", value: `₱${selectedTransaction.price}` },
                {
                  label: "Status",
                  value: (
                    <Chip
                      label={selectedTransaction.status}
                      color={
                        selectedTransaction.status === "Completed"
                          ? "success"
                          : selectedTransaction.status === "pending"
                            ? "warning"
                            : "error"
                      }
                      size="small"
                    />
                  ),
                },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ color: "#555", fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#111" }}
                    component={typeof item.value === "string" ? "span" : "div"}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="primary" variant="contained" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCancelDialogClose}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to cancel the transaction for <strong>{transactionToCancel?.userName}</strong> on{" "}
            <strong>{transactionToCancel?.date}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} variant="outlined" color="primary">
            No
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={loadingId === transactionToCancel?._id}
          >
            {loadingId === transactionToCancel?._id ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
