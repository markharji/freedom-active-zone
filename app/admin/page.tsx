"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Paper, TextField, Button, Typography, Link, Alert, Stack } from "@mui/material";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const ADMIN_REGISTER_PASSWORD = "admin123";

export default function Admin() {
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [loading, setLoading] = useState(false);

  const loginForm = useForm({
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  const router = useRouter();
  const onLogin = async (data) => {
    const { username, password } = data;

    try {
      const response = await axios.post("/api/login", { username, password });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        router.push("/admin/facilities");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const verifyAdminPassword = () => {
    if (adminPassInput === ADMIN_REGISTER_PASSWORD) {
      setAdminVerified(true);
      setError("");
    } else {
      setError("Invalid admin password");
    }
  };

  /* REGISTER SUBMIT */
  const onRegister = async (data) => {
    setLoading(true);
    console.log("REGISTER USER:", data);

    try {
      const response = await axios.put("/api/users", data);
      setLoading(false);
      toast.success("Created User Successfully");
      registerForm.reset();
      setShowRegister(false);
      setAdminVerified(false);
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
  };

  if (ok) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <Link href="/admin/dashboard" underline="hover">
          Go to Dashboard
        </Link>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
      <Paper elevation={3} sx={{ p: 4, width: 380 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          {showRegister ? "Register User" : "Admin Login"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* LOGIN FORM */}
        {!showRegister && (
          <Box component="form" onSubmit={loginForm.handleSubmit(onLogin)} noValidate>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              {...loginForm.register("username", {
                required: "Username is required",
              })}
              error={!!loginForm.formState.errors.username}
              helperText={loginForm.formState.errors.username?.message}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...loginForm.register("password", {
                required: "Password is required",
              })}
              error={!!loginForm.formState.errors.password}
              helperText={loginForm.formState.errors.password?.message}
            />

            <Button fullWidth type="submit" variant="contained" sx={{ mt: 3 }}>
              Login
            </Button>

            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => {
                setShowRegister(true);
                setError("");
              }}
            >
              Register User
            </Button>
          </Box>
        )}

        {/* ADMIN PASSWORD PROMPT */}
        {showRegister && !adminVerified && (
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Admin Password"
              type="password"
              onChange={(e) => setAdminPassInput(e.target.value)}
            />

            <Button variant="contained" onClick={verifyAdminPassword}>
              Verify
            </Button>

            <Button
              variant="text"
              onClick={() => {
                setShowRegister(false);
                setError("");
              }}
            >
              Back to Login
            </Button>
          </Stack>
        )}

        {/* REGISTER FORM */}
        {showRegister && adminVerified && (
          <Box component="form" onSubmit={registerForm.handleSubmit(onRegister)} noValidate>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              {...registerForm.register("name", { required: "Name is required" })}
              error={!!registerForm.formState.errors.name}
              helperText={registerForm.formState.errors.name?.message}
            />

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              {...registerForm.register("username", {
                required: "Username is required",
              })}
              error={!!registerForm.formState.errors.username}
              helperText={registerForm.formState.errors.username?.message}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...registerForm.register("password", {
                required: "Password is required",
              })}
              error={!!registerForm.formState.errors.password}
              helperText={registerForm.formState.errors.password?.message}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              {...registerForm.register("confirmPassword", {
                validate: (value, formValues) => value === formValues.password || "Passwords do not match",
              })}
              error={!!registerForm.formState.errors.confirmPassword}
              helperText={registerForm.formState.errors.confirmPassword?.message}
            />

            <Button loading={loading} fullWidth type="submit" variant="contained" sx={{ mt: 3 }}>
              Register
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
