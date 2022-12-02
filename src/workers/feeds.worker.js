import summitBuildJson from '../content/summit.json';
import eventsBuildJson from '../content/events.json';
import speakersBuildJson from '../content/speakers.json';
import extraQuestionsBuildJson from '../content/extra-questions.json';
import eventsIDXBuildJson from '../content/events.idx.json';
import speakersIDXBuildJson from '../content/speakers.idx.json';

import {
    bucket_getEvents,
    bucket_getExtraQuestions,
    bucket_getSpeakers,
    bucket_getSummit,
    bucket_getEventsIDX,
    bucket_getSpeakersIDX,
} from "../actions/update-data-actions";

import {
    eventsFilePath,
    speakersFilePath,
    extraQuestionFilePath,
    summitFilePath
} from '../utils/StaticFileUtils';

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async ({ data: { summitId, staticJsonFilesBuildTime } }) =>  {
    staticJsonFilesBuildTime = JSON.parse(staticJsonFilesBuildTime);

    console.log(`feeds worker running for ${summitId} ....`)
    // events
    let buildTime = staticJsonFilesBuildTime.find(e => e.file === eventsFilePath).build_time;
    let eventsData = await bucket_getEvents(summitId, buildTime);
    if (!eventsData) eventsData = eventsBuildJson;

    let eventsIDXData = await bucket_getEventsIDX(summitId, buildTime);
    if (!eventsIDXData) eventsIDXData = eventsIDXBuildJson;
    // summit
    buildTime = staticJsonFilesBuildTime.find(e => e.file === summitFilePath).build_time;
    let summitData = await bucket_getSummit(summitId, buildTime);
    if (!summitData) summitData = summitBuildJson;
    //speakers
    buildTime = staticJsonFilesBuildTime.find(e => e.file === speakersFilePath).build_time;
    let speakersData = await bucket_getSpeakers(summitId, buildTime);
    if (!speakersData) speakersData = speakersBuildJson;

    let speakersIXData = await bucket_getSpeakersIDX(summitId, buildTime);
    if (!speakersIXData) speakersIXData = speakersIDXBuildJson;

    // extra questions
    buildTime = staticJsonFilesBuildTime.find(e => e.file === extraQuestionFilePath).build_time;
    let extraQuestionsData = await bucket_getExtraQuestions(summitId, buildTime);
    if (!extraQuestionsData) extraQuestionsData = extraQuestionsBuildJson;

    console.log(`feeds worker sending data to synch...`);
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
        eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, speakersIXData
    });
};