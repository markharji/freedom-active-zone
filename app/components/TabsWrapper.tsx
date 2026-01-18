"use client";

import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";

interface TabsWrapperProps {
  tabs: { label: string; component: React.ReactNode }[];
}

export default function TabsWrapper({ tabs }: TabsWrapperProps) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        aria-label="admin tabs"
        sx={{ mb: 2 }}
      >
        {tabs.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>

      <Box>{tabs[selectedTab].component}</Box>
    </Box>
  );
}
