// src/App.jsx
import React, { useState } from "react";

import { PortalLayout } from "./components/layout/PortalLayout/PortalLayout.jsx";
import { NAV_ITEMS } from "./features/navigation/navConfig.js";
import { useNav } from "./features/navigation/useNav.js";
import { useAuth } from "./features/auth/useAuth.js";
import LoginPage from "./features/auth/LoginPage/LoginPage.jsx";

import { DEFAULT_CONTROLS, NAV_KEYS } from "./lib/constants.js";
import { useRoomModel } from "./features/room/useRoomModel.js";

// Existing pages (you said you already have these)
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import RoomMapPage from "./pages/RoomMap/RoomMapPage.jsx";
import TrendsPage from "./pages/Trends/TrendsPage.jsx";
import EventsPage from "./pages/Events/EventsPage.jsx";
import SettingsPage from "./pages/Settings/SettingsPage.jsx";

export default function App() {
  // session persisted via useAuth()
  const { session, login, logout } = useAuth();

  // active tab persisted via useNav()
  const { activeKey, setActiveKey } = useNav(NAV_KEYS.DASHBOARD);

  // demo knobs (POC); keep local state here so Map + Settings can adjust
  const [controls, setControls] = useState(DEFAULT_CONTROLS);

  // central data model (currently simulated via data/adapters)
  const model = useRoomModel({
    session,
    controls,
    seed: 11,
  });

  // Gate to login
  if (!session) {
    return (
      <LoginPage
        onLogin={({ tenant, roomName }) => {
          login({ tenant, roomName });
          setActiveKey(NAV_KEYS.DASHBOARD);
          setControls(DEFAULT_CONTROLS);
        }}
      />
    );
  }

  return (
    <PortalLayout
      tenant={session.tenant}
      roomName={session.roomName}
      navItems={NAV_ITEMS}
      activeKey={activeKey}
      onSelectNav={setActiveKey}
      onLogout={() => {
        logout();
        setActiveKey(NAV_KEYS.DASHBOARD);
      }}
      topRightChips={[{ tone: "accent", icon: undefined, label: "POC · simulated data" }]}
    >
      {activeKey === NAV_KEYS.DASHBOARD && <DashboardPage model={model} />}

      {activeKey === NAV_KEYS.MAP && (
        <RoomMapPage model={model} controls={controls} setControls={setControls} />
      )}

      {activeKey === NAV_KEYS.TRENDS && <TrendsPage model={model} />}

      {activeKey === NAV_KEYS.EVENTS && <EventsPage model={model} />}

      {activeKey === NAV_KEYS.SETTINGS && (
        <SettingsPage model={model} controls={controls} setControls={setControls} />
      )}
    </PortalLayout>
  );
}
