import summitBuildJson from '../content/summit.json';
import eventsBuildJson from '../content/events.json';
import speakersBuildJson from '../content/speakers.json';
import extraQuestionsBuildJson from '../content/extra-questions.json';

import {
    bucket_getEvents,
    bucket_getExtraQuestions,
    bucket_getSpeakers,
    bucket_getSummit
} from "../actions/update-data-actions";

onmessage = async ({ data: { summitId } }) =>  {
    console.log(`feeds worker running for ${summitId} ....`)
    // events
    let eventsData = await bucket_getEvents(summitId);
    if (!eventsData) eventsData = eventsBuildJson;
    // summit
    let summitData = await bucket_getSummit(summitId);
    if (!summitData) summitData = summitBuildJson;
    //speakers
    let speakersData = await bucket_getSpeakers(summitId);
    if (!speakersData) speakersData = speakersBuildJson;
    // extra questions
    let extraQuestionsData = await bucket_getExtraQuestions(summitId);
    if (!extraQuestionsData) extraQuestionsData = extraQuestionsBuildJson;

    console.log(`feeds worker sending data to synch...`);
    postMessage({
        eventsData, summitData, speakersData, extraQuestionsData
    });
};