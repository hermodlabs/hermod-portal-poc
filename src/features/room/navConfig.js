import {
  BarChart3,
  DoorOpen,
  Grid3X3,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { NAV_KEYS, NAV_ORDER } from "../../lib/constants.js";

export const NAV_ITEMS = [
  { key: NAV_KEYS.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { key: NAV_KEYS.MAP, label: "Room map", icon: Grid3X3 },
  { key: NAV_KEYS.TRENDS, label: "Trends", icon: BarChart3 },
  { key: NAV_KEYS.EVENTS, label: "Events", icon: DoorOpen },
  { key: NAV_KEYS.SETTINGS, label: "Settings", icon: Settings },
].sort((a, b) => NAV_ORDER.indexOf(a.key) - NAV_ORDER.indexOf(b.key));
