"use client";

import { useState, useEffect, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import DataTable from "react-data-table-component";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import toast from "react-hot-toast";
import dayjs from "dayjs";

type Reward = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  discountValue?: number;
  discountType?: "percentage" | "amount";
};

export default function RewardsTable() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ title: "", selectedDate: "", status: "all" });
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);

  const { control, handleSubmit, reset, watch, setError, clearErrors } = useForm({
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
      status: "active",
      discountValue: "",
      discountType: "percentage",
    },
  });

  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchDiscountType = watch("discountType");

  // Date validation
  useEffect(() => {
    if (watchStartDate && watchEndDate && watchEndDate < watchStartDate) {
      setError("endDate", { type: "manual", message: "End date cannot be before start date" });
    } else {
      clearErrors("endDate");
    }
  }, [watchStartDate, watchEndDate, setError, clearErrors]);

  // Fetch rewards
  const fetchRewards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.title) params.append("title", filters.title);
      if (filters.status) params.append("status", filters.status);
      if (filters.selectedDate) params.append("selectedDate", filters.selectedDate);

      const res = await fetch(`/api/rewards?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch rewards");
      const data = await res.json();
      setRewards(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  // Submit form (Create / Update)
  const onSubmit = async (data: any) => {
    try {
      const isUpdate = !!editingReward;
      const url = isUpdate ? `/api/rewards/${editingReward!._id}` : "/api/rewards";
      const method = isUpdate ? "PUT" : "POST";

      const payload = {
        ...data,
        startDate: dayjs(data.startDate).toISOString(),
        endDate: dayjs(data.endDate).toISOString(),
        discountValue: Number(data.discountValue),
        discountType: data.discountType,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || (isUpdate ? "Failed to update reward" : "Failed to create reward"));

      toast.success(isUpdate ? "Reward updated successfully" : "Reward added successfully");
      setOpen(false);
      reset({
        title: "",
        startDate: "",
        endDate: "",
        status: "active",
        discountValue: "",
        discountType: "percentage",
      });
      setEditingReward(null);
      fetchRewards();
    } catch (err: any) {
      toast.error(err.message || "Error saving reward");
    }
  };

  // Open Update modal
  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);

    const formatDate = (isoDate: string) => isoDate.split("T")[0];

    reset({
      title: reward.title,
      startDate: formatDate(reward.startDate),
      endDate: formatDate(reward.endDate),
      status: reward.status,
      discountValue: reward.discountValue || "",
      discountType: reward.discountType || "percentage",
    });

    setOpen(true);
  };

  // Delete reward
  const handleOpenDeleteDialog = (reward: Reward) => {
    setRewardToDelete(reward);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!rewardToDelete) return;

    try {
      const res = await fetch(`/api/rewards/${rewardToDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete reward");
      toast.success("Reward deleted");
      fetchRewards();
    } catch (err: any) {
      toast.error(err.message || "Error deleting reward");
    } finally {
      setDeleteDialogOpen(false);
      setRewardToDelete(null);
    }
  };

  // Status toggle
  const handleStatusChange = async (id: string, newStatus: "active" | "inactive") => {
    try {
      const res = await fetch(`/api/rewards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated");
      fetchRewards();
    } catch (err: any) {
      toast.error(err.message || "Error updating status");
    }
  };

  const columns = [
    { name: "Title", selector: (row: Reward) => row.title, sortable: true },
    { name: "Start Date", selector: (row: Reward) => dayjs(row.startDate).format("DD-MM-YYYY"), sortable: true },
    { name: "End Date", selector: (row: Reward) => dayjs(row.endDate).format("DD-MM-YYYY"), sortable: true },
    {
      name: "Discount",
      selector: (row: Reward) => `${row.discountValue} ${row.discountType === "percentage" ? "%" : "$"}`,
    },
    {
      name: "Status",
      cell: (row: Reward) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.status === "active"}
              onChange={(e) => handleStatusChange(row._id, e.target.checked ? "active" : "inactive")}
            />
          }
          label={row.status}
        />
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Reward) => (
        <Box className="flex gap-2">
          <Button variant="outlined" size="small" onClick={() => handleEdit(row)}>
            Update
          </Button>
          <Button variant="outlined" size="small" color="error" onClick={() => handleOpenDeleteDialog(row)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <div className="mt-4">
      {/* Filters & Add button */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <Box className="flex gap-2 flex-wrap">
          <TextField
            size="small"
            label="Reward Title"
            value={filters.title}
            onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
          />
          <TextField
            size="small"
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.selectedDate || ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, selectedDate: e.target.value }))}
          />
          <TextField
            size="small"
            label="Status"
            select
            SelectProps={{ native: true }}
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </TextField>
          <Button variant="contained" onClick={fetchRewards}>
            Filter
          </Button>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setEditingReward(null);
            reset({
              title: "",
              startDate: "",
              endDate: "",
              status: "active",
              discountValue: "",
              discountType: "percentage",
            });
            setOpen(true);
          }}
        >
          Add Reward
        </Button>
      </Box>

      {/* Rewards Table */}
      <DataTable
        columns={columns}
        data={rewards}
        progressPending={loading}
        pagination
        highlightOnHover
        pointerOnHover
      />

      {/* Add / Update Reward Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingReward ? "Update Reward" : "Add Reward"}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="flex flex-col gap-4">
            <Controller
              name="title"
              control={control}
              rules={{ required: "Reward title is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Reward Title"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Start date is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="endDate"
              control={control}
              rules={{ required: "End date is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="End Date"
                  type="date"
                  inputProps={{ min: watchStartDate || undefined }}
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            {/* Discount Type Switch */}
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value === "percentage"}
                      onChange={(e) => field.onChange(e.target.checked ? "percentage" : "amount")}
                    />
                  }
                  label={field.value === "percentage" ? "Percentage %" : "Amount"}
                />
              )}
            />

            {/* Discount Value */}
            <Controller
              name="discountValue"
              control={control}
              rules={{ required: "Discount value is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={watchDiscountType === "percentage" ? "Discount %" : "Discount Amount"}
                  type="number"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value === "active"}
                      onChange={(e) => field.onChange(e.target.checked ? "active" : "inactive")}
                    />
                  }
                  label={field.value}
                />
              )}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingReward ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete reward "{rewardToDelete?.title}"?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
