import {
  MARKETING_SETTINGS_KEYS
} from "./useMarketingSettings";

import marketingSettings from "content/marketing-settings.json";

const summitDeltaStartTime = marketingSettings.find(
  (setting) => setting.key === MARKETING_SETTINGS_KEYS.summitDeltaStartTime
)?.value;

export const PHASES = {
  BEFORE: -1,
  DURING: 0,
  AFTER: 1,
};

export const isValidUTC = (timestamp) => typeof timestamp === 'number';

export const getSummitPhase = function (summit, now) {

  if (!summit) return null;

  const { start_date, end_date } = summit;

  const deltaSummit = summitDeltaStartTime ? parseInt(summitDeltaStartTime) : 0;

  return start_date - deltaSummit <= now && end_date > now ? PHASES.DURING
      :
      start_date - deltaSummit > now ? PHASES.BEFORE
        :
        end_date <= now ? PHASES.AFTER : null;

};

export const getEventPhase = function (event, now) {
  const { start_date, end_date } = event;

  return start_date <= now && end_date > now ? PHASES.DURING
      :
      start_date > now ? PHASES.BEFORE
        :
        end_date <= now ? PHASES.AFTER : null;
};

export const getVotingPeriodPhase = (votingPeriod, now) => {
  const { startDate, endDate } = votingPeriod;

  if (!isValidUTC(now)) return null;

  const isValidStartDate = isValidUTC(startDate);
  const isValidEndDate = isValidUTC(endDate);

  if ((!isValidStartDate && isValidEndDate && endDate > now) ||
      (!isValidEndDate && isValidStartDate && startDate < now) ||
      // can vote if no start date end date set; no restrictions
      (!isValidStartDate && !isValidEndDate))
    return PHASES.DURING;

  return isValidStartDate && startDate <= now && isValidEndDate && endDate > now ? PHASES.DURING :
         isValidStartDate && startDate > now ? PHASES.BEFORE :
         isValidEndDate && endDate <= now ? PHASES.AFTER : null;
};