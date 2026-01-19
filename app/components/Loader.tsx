import { CircularProgress } from "@mui/material";

export default function Loader() {
  return (
    <div className="p-4 w-full flex items-center justify-center">
      <CircularProgress color="secondary" />
      <CircularProgress color="success" />
      <CircularProgress color="inherit" />
    </div>
  );
}
