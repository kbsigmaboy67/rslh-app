const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  version: "RSLH FINAL"
});