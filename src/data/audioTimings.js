import { NAMES } from "./referenceData.js";

const audioTimings = NAMES.map((name) => ({
  id: name.id,
  name: name.transliteration,
  start: name.audioStart,
  end: name.audioEnd,
  status: "verified",
}));

export default audioTimings;
