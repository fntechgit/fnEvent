import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import {compose} from "redux";
import HeroComponent from "../components/HeroComponent";
import { updateFilter, updateFiltersFromHash } from "../actions/schedule-actions";
import { reloadScheduleData } from '../actions/base-actions';

// This HOC makes sure the schedules array in allSchedulesState is populated before render.

const componentWrapper = (WrappedComponent) => ({schedules, ...props}) => {
  const [loaded, setLoaded] = useState(false);
  const { updateFiltersFromHash, reloadScheduleData, schedKey } = props;
  const scheduleState = schedules?.find( s => s.key === schedKey);
  const { key, filters, view } = scheduleState || {};

  // on first load we load schedules data, always
  useEffect(() => {
    reloadScheduleData();
  }, []);

  useEffect(() => {
    if (schedules.length > 0) {
      updateFiltersFromHash(schedKey, filters, view);
      setLoaded(true);
    }
  }, [key]);

  if (!loaded)
    return <HeroComponent title="Loading schedule data" />;

  return <WrappedComponent {...props} scheduleState={scheduleState} />;
};

const mapStateToProps = ({
  summitState,
  clockState,
  loggedUserState,
  allSchedulesState,
  settingState,
}) => ({
  summit: summitState.summit,
  summitPhase: clockState.summit_phase,
  isLoggedUser: loggedUserState.isLoggedUser,
  schedules: allSchedulesState.schedules,
  colorSettings: settingState.colorSettings,
});

const reduxConnection = connect(mapStateToProps, {
  updateFiltersFromHash,
  updateFilter,
  reloadScheduleData,
});

const withScheduleData = compose(reduxConnection, componentWrapper);

export default withScheduleData;