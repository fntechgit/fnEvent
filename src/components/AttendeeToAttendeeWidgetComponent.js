import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Sentry from "@sentry/react";
import { connect } from "react-redux";
import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { getAccessToken } from "openstack-uicore-foundation/lib/security/methods";
import {
  AttendeeToAttendeeContainer,
  permissions,
  scopes,
  Tracker,
} from "attendee-to-attendee-widget";
import {
  getEnvVariable,
  CHAT_API_BASE_URL,
  IDP_BASE_URL,
  STREAM_IO_API_KEY,
  SUMMIT_ID,
  SUPABASE_URL,
  SUPABASE_KEY,
} from "../utils/envVariables";
import { PHASES } from "../utils/phasesUtils";

import "attendee-to-attendee-widget/dist/index.css";

import { SentryFallbackFunction } from "./SentryErrorComponent";
import { onInitLogoutEvent } from "../utils/customEvents";

const sbAuthProps = {
  supabaseUrl: getEnvVariable(SUPABASE_URL),
  supabaseKey: getEnvVariable(SUPABASE_KEY),
};

const adminGroups = ["administrators", "super-admins"];

export const AttendeesWidget = ({ user, event, chatSettings }) => {
  const [loading, setLoading] = useState(true);

  //Deep linking support
  const sdcRef = useRef();
  const shcRef = useRef();
  const sqacRef = useRef();
  const ocrRef = useRef();

  const { userProfile, idpProfile } = user || {};
  const { summit_tickets } = userProfile || {};
  const { 
    email, 
    groups, 
    bio,
    given_name,
    family_name,
    picture,
    company,
    job_title,
    sub, 
    github_user,
    linked_in_profile,
    twitter_name,
    wechat_user,
    public_profile_show_fullname } = idpProfile || {};

  useEffect(() => {
    if (!user || !userProfile || !idpProfile) return;
    const fragmentParser = new FragmentParser();
    const starHelpChatParam = fragmentParser.getParam("starthelpchat");
    const starQAChatParam = fragmentParser.getParam("startqachat");
    const starDirectChatParam = fragmentParser.getParam("startdirectchat");
    const openChatRoomParam = fragmentParser.getParam("openchatroom");

    if (starHelpChatParam && shcRef.current) {
      shcRef.current.startHelpChat();
    } else if (starQAChatParam && sqacRef.current) {
      sqacRef.current.startQAChat();
    } else if (starDirectChatParam && sdcRef.current) {
      sdcRef.current.startDirectChat(starDirectChatParam);
    } else if (openChatRoomParam && ocrRef.current) {
      ocrRef.current.openChatRoom(openChatRoomParam);
    }
    setLoading(false);
  }, [user, idpProfile, userProfile]);

  if (loading) return <div style={{ margin: "20px auto", position: "relative" }}>Loading...</div>;

  const chatProps = {
    streamApiKey: getEnvVariable(STREAM_IO_API_KEY),
    apiBaseUrl: getEnvVariable(IDP_BASE_URL),
    chatApiBaseUrl: getEnvVariable(CHAT_API_BASE_URL),
    onAuthError: (err, res) => console.log(err),
    openDir: "left",
    activity: null,
    getAccessToken: async () => {
      const accessToken = await getAccessToken();
      //console.log("AttendeesList->getAccessToken", accessToken);
      return accessToken;
    },
  };

  if (event) {
    //Widget will create this activity room or add members to it
    chatProps.activity = {
      id: event.id,
      name: event.title,
      imgUrl: event.image,
    };
  }

  const widgetProps = {
    user: {
      id: sub.toString(),
      idpUserId: sub.toString(),
      fullName: public_profile_show_fullname ? `${given_name} ${family_name}` : `${given_name}`,
      email: email,
      company: company,
      title: job_title,
      picUrl: picture,
      socialInfo: {
        githubUser: github_user,
        linkedInProfile: linked_in_profile,
        twitterName: twitter_name,
        wechatUser: wechat_user,
      },
      getBadgeFeatures: () =>
        summit_tickets
          .filter((st) => st.badge)
          .flatMap((st) => st.badge.features)
          .filter((v, i, a) => a.map((item) => item.id).indexOf(v.id) === i),
      bio: bio,
      hasPermission: (permission) => {
        const isAdmin =  groups &&
            groups.map((g) => g.slug).filter((g) => adminGroups.includes(g))
                .length > 0;
        switch (permission) {
          case permissions.MANAGE_ROOMS:
            return isAdmin;
          case permissions.CHAT:
            if(isAdmin) return true;
            const accessLevels = summit_tickets
              .flatMap((x) => x.badge?.type.access_levels)
              .filter(
                (v, i, a) => a.map((item) => item.id).indexOf(v.id) === i
              ); //distinct
            if (accessLevels && accessLevels.length > 0) {
              const canChat = accessLevels
                .filter((a) => a.name)
                .map((a) => a.name.toUpperCase())
                .includes("CHAT");
              console.log(
                "AL",
                accessLevels.map((a) => a.name)
              );
              return canChat;
            }
            return false;
          default:
            return false;
        }
      },
    },
    summitId: parseInt(getEnvVariable(SUMMIT_ID)),
    height: 400,
    defaultScope: chatSettings?.defaultScope || scopes.PAGE,  //Default attendees filter scope (scopes.PAGE | scopes.SHOW)
    ...chatProps,
    ...sbAuthProps,
  };

  return (
    <div style={{ margin: "20px auto", position: "relative" }}>
        <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'Attendee To Attendee'})}>
          <AttendeeToAttendeeContainer
            {...widgetProps}
            ref={{ sdcRef, shcRef, sqacRef, ocrRef }}
          />
        </Sentry.ErrorBoundary>
      </div>
  );
};

const AccessTracker = ({ user, isLoggedUser, summitPhase }) => {
  const trackerRef = useRef();

  const handleLogout = useCallback(() => {
    if(trackerRef.current)
      trackerRef.current.signOut();
  },[]);

  useEffect(()=>{
    window.addEventListener(onInitLogoutEvent, handleLogout)
    return () => window.removeEventListener(onInitLogoutEvent, handleLogout);
  },[]);

  useEffect(() => {
    if (!isLoggedUser) {
      if(trackerRef.current)
          trackerRef.current.signOut();
    }
  }, [isLoggedUser]);

  const userCanByPassAuthz = () => {
    return user.isAuthorized;
  };

  // if summit_phase wasn't initialized yet (eg: due to a delay in the reducer), 
  // this render shouldn't continue
  if (summitPhase === null) return null;

  // if summit hasn't started yet ...
  if (!userCanByPassAuthz() && summitPhase === PHASES.BEFORE) {
    console.log('A2A tracker - summit has not started yet')
    return null;
  }

  if (!user || !user.userProfile || !user.idpProfile) {
    console.log('A2A tracker - cannot track user')
    return null;
  }

  const { summit_tickets } = user.userProfile;
  const {
    bio,
    given_name,
    family_name,
    email,
    picture,
    company,
    job_title,
    sub,
    github_user,
    linked_in_profile,
    twitter_name,
    wechat_user,
    public_profile_show_fullname,
    public_profile_show_email,
    public_profile_allow_chat_with_me
  } = user.idpProfile;

  const widgetProps = {
    user: {
      idpUserId: sub,
      fullName: public_profile_show_fullname ? `${given_name} ${family_name}` : `${given_name}`,
      email: email,
      company: company,
      title: job_title,
      picUrl: picture,
      socialInfo: {
        githubUser: github_user,
        linkedInProfile: linked_in_profile,
        twitterName: twitter_name,
        wechatUser: wechat_user,
      },
      getBadgeFeatures: () =>
        summit_tickets
          .filter((st) => st.badge)
          .flatMap((st) => st.badge.features)
          .filter((v, i, a) => a.map((item) => item.id).indexOf(v.id) === i),
      bio: bio,
      showEmail: public_profile_show_email,
      allowChatWithMe: public_profile_allow_chat_with_me ?? true
    },
    summitId: parseInt(getEnvVariable(SUMMIT_ID)),
    ...sbAuthProps,
  };

  return <Tracker {...widgetProps} ref={trackerRef} />;
};

const mapStateToProps = ({ loggedUserState, userState, clockState, settingState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  user: userState,
  summitPhase: clockState.summit_phase,
  chatSettings: settingState.widgets.chat
});

export default connect(mapStateToProps)(AccessTracker);
