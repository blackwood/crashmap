import { format, parseISO } from "date-fns";

export const dateToSimpleISO = (date) => {
  return new Date(date).toISOString().substring(0, 10);
};
export const humanifyDate = (date) => {
  return format(parseISO(date), "PPP");
};

export const cleanInjuryType = (crash) => {
  let maybeInjury = (
    crash.p1_non_motorist_desc
      ? crash.p1_injury
      : crash.p2_non_motorist_desc
      ? crash.p2_injury
      : "UNKNOWN"
  ).trim();
  return maybeInjury || "UNKNOWN";
};

export const expandToOptions = (arr) =>
  arr.map((v) => ({ label: v, value: v }));
