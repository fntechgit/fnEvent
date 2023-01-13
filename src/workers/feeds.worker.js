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
    summitFilePath,
    eventsIdxFilePath,
    speakersIdxFilePath,
} from '../utils/StaticFileUtils';

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async ({data: {summitId, staticJsonFilesBuildTime}}) => {
    staticJsonFilesBuildTime = JSON.parse(staticJsonFilesBuildTime);

    console.log(`feeds worker running for ${summitId} ....`)
    const calls = [];

    // events
    let buildTime = staticJsonFilesBuildTime.find(e => e.file === eventsFilePath).build_time;

    calls.push(bucket_getEvents(summitId, buildTime));

    buildTime = staticJsonFilesBuildTime.find(e => e.file === eventsIdxFilePath).build_time;
    calls.push(bucket_getEventsIDX(summitId, buildTime));

    // summit
    buildTime = staticJsonFilesBuildTime.find(e => e.file === summitFilePath).build_time;
    calls.push(bucket_getSummit(summitId, buildTime));


    //speakers
    buildTime = staticJsonFilesBuildTime.find(e => e.file === speakersFilePath).build_time;
    calls.push(bucket_getSpeakers(summitId, buildTime));


    buildTime = staticJsonFilesBuildTime.find(e => e.file === speakersIdxFilePath).build_time;
    calls.push(bucket_getSpeakersIDX(summitId, buildTime));

    // extra questions
    buildTime = staticJsonFilesBuildTime.find(e => e.file === extraQuestionFilePath).build_time;
    calls.push(bucket_getExtraQuestions(summitId, buildTime));


    Promise.all(calls)
        .then((values) => {

            console.log(`feeds worker sending data to synch...`, values);

            let eventsData = values[0];
            let eventsIDXData = values[1];
            let summitData = values[2];
            let speakersData = values[3];
            let speakersIXData = values[4];
            let extraQuestionsData = values[5];

            if (!eventsData) eventsData = eventsBuildJson;
            if (!eventsIDXData) eventsIDXData = eventsIDXBuildJson;
            if (!summitData) summitData = summitBuildJson;
            if (!speakersData) speakersData = speakersBuildJson;
            if (!speakersIXData) speakersIXData = speakersIDXBuildJson;
            if (!extraQuestionsData) extraQuestionsData = extraQuestionsBuildJson;

            /* eslint-disable-next-line no-restricted-globals */
            self.postMessage({
                eventsData, summitData, speakersData, extraQuestionsData, eventsIDXData, speakersIXData
            });
        });

};