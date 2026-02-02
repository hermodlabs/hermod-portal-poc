// jest.config.js  (ESM)
export default {
  testEnvironment: "jsdom",

  // If you actually have TS, keep these; otherwise you can delete the line entirely.
  // extensionsToTreatAsEsm: [".ts", ".tsx"],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },

  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  transform: {}
};
