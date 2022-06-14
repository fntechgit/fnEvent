import React, { useEffect } from "react"
import { Router, Location } from "@reach/router"
import { connect } from 'react-redux'
import { syncData } from '../../actions/base-actions';
import settings from '../../content/settings';

import HomePage from "../../templates/home-page"
import EventPage from "../../templates/event-page"
import PostersPage from "../../templates/posters-page";
import SchedulePage from "../../templates/schedule-page";
import SponsorPage from "../../templates/sponsor-page"
import ExpoHallPage from "../../templates/expo-hall-page"
import FullProfilePage from "../../templates/full-profile-page"
import WithAuthRoute from '../../routes/WithAuthRoute'
import ExtraQuestionsPage from "../../templates/extra-questions-page"
import ShowOpenRoute from "../../routes/ShowOpenRoute";
import WithBadgeRoute from "../../routes/WithBadgeRoute";
import PosterDetailPage from "../../templates/poster-detail-page";
import MyTicketsPage from '../../templates/my-tickets-page';
import WithTicketRoute from "../../routes/WithTicketRoute";

const App = ({ isLoggedUser, user, summit_phase, lastBuild, syncData }) => {

  useEffect(() => {
    if (!lastBuild || settings.lastBuild > lastBuild) {
      syncData();
    }
  }, [lastBuild, syncData]);

  return (
    <Location>
      {({ location }) => (
        <Router basepath="/a" >
          <WithTicketRoute path="/extra-questions" location={location}>
            <ExtraQuestionsPage path="/" isLoggedIn={isLoggedUser} user={user} location={location} />
          </WithTicketRoute>
          <SchedulePage path="/schedule" location={location} schedKey="schedule-main" />
          <WithAuthRoute path="/" summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} location={location}>
            <PostersPage path="/posters" trackGroupId={0} location={location} />
            <PostersPage path="/posters/:trackGroupId" location={location} />
            <PosterDetailPage path="/poster/:presentationId/" isLoggedIn={isLoggedUser} user={user} location={location} />
            <SchedulePage path="/my-schedule" location={location} summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} scheduleProps={{ title: 'My Schedule' }} schedKey="my-schedule-main" />
            <FullProfilePage path="/profile" summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} location={location} />
            <MyTicketsPage path="/my-tickets" isLoggedIn={isLoggedUser} user={user} location={location} />
            <ShowOpenRoute path="/" summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} location={location}>
              <WithBadgeRoute path="/event/:eventId" summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} location={location}>
                <EventPage path="/" summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} location={location} />
              </WithBadgeRoute>
              <HomePage path="/" isLoggedIn={isLoggedUser} user={user} location={location} />
              <SponsorPage path="/sponsor/:sponsorId" summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} location={location} />
              <ExpoHallPage path="/sponsors/" summit_phase={summit_phase} isLoggedIn={isLoggedUser} user={user} location={location} />
            </ShowOpenRoute>
          </WithAuthRoute>
        </Router>
      )}
    </Location>
  )
};

const mapStateToProps = ({ loggedUserState, userState, clockState, settingState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  summit_phase: clockState.summit_phase,
  user: userState,
  lastBuild: settingState.lastBuild
});

export default connect(mapStateToProps, { syncData })(App)