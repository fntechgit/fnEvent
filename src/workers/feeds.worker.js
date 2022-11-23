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

const eventsFilePath = 'src/content/events.json';
const speakersFilePath = 'src/content/speakers.json';
const voteablePresentationFilePath = 'src/content/voteable_presentations.json';
const extraQuestionFilePath = 'src/content/extra-questions.json';
const summitFilePath = 'src/content/summit.json';


onmessage = async ({ data: { summitId, staticJsonFilesBuildTime } }) =>  {
    console.log(`feeds worker running for ${summitId} ....`)
    // events
    let buildTime = staticJsonFilesBuildTime.find(e => e.file == eventsFilePath).build_time;
    let eventsData = await bucket_getEvents(summitId, buildTime);
    if (!eventsData) eventsData = eventsBuildJson;
    // summit
    buildTime = staticJsonFilesBuildTime.find(e => e.file == summitFilePath, buildTime).build_time;
    let summitData = await bucket_getSummit(summitId);
    if (!summitData) summitData = summitBuildJson;
    //speakers
    buildTime = staticJsonFilesBuildTime.find(e => e.file == speakersFilePath).build_time;
    let speakersData = await bucket_getSpeakers(summitId, buildTime);
    if (!speakersData) speakersData = speakersBuildJson;
    // extra questions
    buildTime = staticJsonFilesBuildTime.find(e => e.file == extraQuestionFilePath).build_time;
    let extraQuestionsData = await bucket_getExtraQuestions(summitId, buildTime);
    if (!extraQuestionsData) extraQuestionsData = extraQuestionsBuildJson;

    console.log(`feeds worker sending data to synch...`);
    postMessage({
        eventsData, summitData, speakersData, extraQuestionsData
    });
};