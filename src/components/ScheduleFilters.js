import * as React from "react";
import { pickBy } from "lodash";
import * as Sentry from "@sentry/react";
import Filters from "schedule-filter-widget/dist";
import "schedule-filter-widget/dist/index.css";
// awesome-bootstrap-checkbox css dependency 
// https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css
// injected through HeadComponents
import styles from "../styles/full-schedule.module.scss";

import { SentryFallbackFunction } from "./SentryErrorComponent";

const ScheduleFilters = ({ className, filters, ...rest }) => {
  const enabledFilters = pickBy(filters, (value) => value.enabled);
  const { allEvents } = rest;
  /* if we dont have events .. does not render , bc on first
     render does the initial widget loading call to initialize */
  if(!allEvents.length) return null;
  return (
    <>
      <div className={styles.filters}>
        <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'Schedule Filter'})}>
          <Filters title="Filter by" filters={enabledFilters} {...rest} />
        </Sentry.ErrorBoundary>
      </div>
    </>
  );
};

export default ScheduleFilters;
