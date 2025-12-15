import { useEffect, useState } from "react";
import { NAV_KEYS, STORAGE_KEYS } from "../../lib/constants.js";
import { readJSON, writeJSON } from "../../lib/storage.js";

export function useNav(defaultKey = NAV_KEYS.DASHBOARD) {
  const [activeKey, setActiveKey] = useState(() => readJSON(STORAGE_KEYS.ACTIVE_TAB, defaultKey));

  useEffect(() => {
    writeJSON(STORAGE_KEYS.ACTIVE_TAB, activeKey);
  }, [activeKey]);

  return { activeKey, setActiveKey };
}
