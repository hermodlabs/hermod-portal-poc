import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../../lib/constants.js";
import { readJSON, writeJSON, removeKey } from "../../lib/storage.js";

const DEFAULT_SESSION = null;
// Example session shape:
// { tenant: "Cedar & Ash Cigar Lounge", roomName: "Walk-in Humidor" }

export function useAuth() {
  const [session, setSession] = useState(() => readJSON(STORAGE_KEYS.AUTH, DEFAULT_SESSION));

  useEffect(() => {
    if (session) writeJSON(STORAGE_KEYS.AUTH, session);
    else removeKey(STORAGE_KEYS.AUTH);
  }, [session]);

  const login = ({ tenant, roomName }) => {
    setSession({ tenant, roomName });
  };

  const logout = () => setSession(null);

  return { session, login, logout };
}
