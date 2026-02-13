import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Box, Typography, Divider, Button, IconButton, Tabs, Tab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import BookingModal from "./BookingModal";

const localizer = momentLocalizer(moment);

const minTime = new Date();
minTime.setHours(7, 0, 0, 0);

const maxTime = new Date();
maxTime.setHours(23, 0, 0, 0);

export default function SportsSchedule() {
  const [facilityTransactions, setFacilityTransactions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFacility, setLoadingFacility] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openBooking, setOpenBooking] = useState(false);

  const tabMap = ["all", "Basketball", "Pickleball"];

  const handleClose = () => setSelectedEvent(null);

  // Fetch data whenever selectedTab changes
  useEffect(() => {
    fetchFacilities();
    fetchFacilityTransactions();
  }, [selectedTab]);

  // Fetch facilities
  const fetchFacilities = async () => {
    setLoadingFacility(true);
    try {
      const params = new URLSearchParams();
      params.append(
        "sports",
        JSON.stringify(tabMap[selectedTab] === "all" ? ["Basketball", "Pickleball"] : [tabMap[selectedTab]]),
      );

      const res = await fetch(`/api/facilities?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch facilities");
      const data = await res.json();
      setFacilities(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingFacility(false);
    }
  };

  // Fetch facility transactions
  const fetchFacilityTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("sport", String(tabMap[selectedTab]));

      const res = await fetch(`/api/facility-transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch facility transactions");
      const data = await res.json();

      // Map transactions to calendar events
      const events = data.map((tx) => {
        const [day, month, year] = tx.date.split("-");
        const [startHour, startMinute] = tx.startTime.split(":");
        const [endHour, endMinute] = tx.endTime.split(":");

        return {
          id: tx._id,
          title: tx.facility.name,
          start: new Date(+year, +month - 1, +day, +startHour, +startMinute),
          end: new Date(+year, +month - 1, +day, +endHour, +endMinute),
          resourceId: tx.facility._id,
          facilityName: tx.facility.name,
          facilityPrice: tx.facility.price,
          description: tx.facility.description,
          price: tx.price,
          status: tx.status,
          userName: tx.userName,
          userEmail: tx.userEmail,
          userContact: tx.userContact,
          sport: tx.facility.sport,
        };
      });

      setFacilityTransactions(events);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  // Custom toolbar with tabs and navigation
  const CustomToolbar = (toolbar) => {
    const goToBack = () => toolbar.onNavigate("PREV");
    const goToNext = () => toolbar.onNavigate("NEXT");
    const goToToday = () => toolbar.onNavigate("TODAY");

    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <Tabs
            className="max-w-full"
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="All Sports" />
            <Tab label="Basketball" />
            <Tab label="Pickleball" />
          </Tabs>

          <div className="text-lg font-semibold text-gray-700">{toolbar.label}</div>

          <div className="flex gap-2">
            <button
              onClick={goToBack}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:shadow-sm transition duration-300"
            >
              Back
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:shadow-sm transition duration-300"
            >
              Today
            </button>
            <button
              onClick={goToNext}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:shadow-sm transition duration-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ResourceHeader = ({ label }) => (
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="text-sm font-semibold text-gray-800 truncate">{label}</div>
      <div className="text-xs text-gray-500">Available Today</div>
    </div>
  );

  const handleSubmitBooking = async (data) => {
    try {
      setLoading(true);

      const totalHours =
        data.startTime && data.endTime
          ? parseInt(data.endTime.split(":")[0]) - parseInt(data.startTime.split(":")[0])
          : 0;

      const totalPrice = totalHours * selectedSlot?.facility?.price;

      const payload = {
        ...data,
        date: data.date.format("DD-MM-YYYY"),
        facility: selectedSlot?.facility,
        facilityId: selectedSlot?.facility._id,
        price: totalPrice,
      };

      const res = await fetch("/api/facility-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to book facility");

      setSelectedSlot(null);
      fetchFacilityTransactions();
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Booking failed");
    }
  };

  return (
    <div className="bg-white p-4 rounded w-full">
      <Calendar
        localizer={localizer}
        events={facilityTransactions}
        resources={
          facilities?.map((res) => ({
            resourceId: res._id,
            resourceTitle: res.name,
          })) || []
        }
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={(event) => {
          let backgroundColor = "#3174ad"; // default

          if (event.status === "cancelled") {
            backgroundColor = "#d03032";
          } else if (event.status === "pending") {
            backgroundColor = "#ed6b03";
          } else if (event.status === "confirmed") {
            backgroundColor = "#2f7c33";
          }

          return {
            style: {
              backgroundColor,
              borderRadius: "6px",
              opacity: 0.9,
              color: "white",
              border: "none",
            },
          };
        }}
        components={{
          resourceHeader: ResourceHeader,
          toolbar: CustomToolbar,
          event: ({ event }) => (
            <div className="flex flex-col">
              <p className="truncate text-[12px]">Name: {event.userName}</p>
              <p className="truncate text-[12px]">Email: {event.userEmail}</p>
            </div>
          ),
        }}
        min={minTime}
        max={maxTime}
        defaultView={Views.DAY}
        views={[Views.DAY]}
        step={60}
        timeslots={1}
        style={{ height: "100%" }}
        onSelectEvent={(event) => setSelectedEvent(event)}
        selectable
        onSelectSlot={(slotInfo) => {
          const facility = facilities.find(({ _id }) => _id === slotInfo.resourceId);
          setSelectedSlot({ ...slotInfo, facility });
          setOpenBooking(true);
        }}
      />

      {/* Modal */}
      <Modal
        open={!!selectedEvent}
        onClose={handleClose}
        aria-labelledby="event-modal-title"
        aria-describedby="event-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            outline: "none",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="event-modal-title" variant="h6" component="h2">
              {selectedEvent?.title} ({selectedEvent?.sport})
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            <strong>User:</strong> {selectedEvent?.userName} ({selectedEvent?.userEmail})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Contact:</strong> {selectedEvent?.userContact}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Start:</strong> {selectedEvent?.start.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>End:</strong> {selectedEvent?.end.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Facility Description:</strong> {selectedEvent?.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Price:</strong> ${selectedEvent?.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Status:</strong> {selectedEvent?.status}
          </Typography>

          <Box mt={3} textAlign="right">
            <Button variant="contained" color="primary" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <BookingModal
        fetchFacilityTransactions={fetchFacilityTransactions}
        open={openBooking}
        onClose={() => setOpenBooking(false)}
        slot={selectedSlot}
        loading={loading}
      />
    </div>
  );
}
