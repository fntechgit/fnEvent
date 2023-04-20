import summitBuildJson from '../content/summit.json';
import eventsBuildJson from '../content/events.json';
import speakersBuildJson from '../content/speakers.json';
import eventsIDXBuildJson from '../content/events.idx.json';
import speakersIDXBuildJson from '../content/speakers.idx.json';
import settings from '../content/settings.json';

import {
    bucket_getEvents,
    bucket_getSpeakers,
    bucket_getSummit,
    bucket_getEventsIDX,
    bucket_getSpeakersIDX,
} from "../actions/update-data-actions";

import {
    eventsFilePath,
    speakersFilePath,
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


    Promise.all(calls)
        .then((values) => {
            let lastModified = settings.lastBuild;
            let eventsData = values[0];
            let eventsIDXData = values[1];
            let summitData = values[2];
            let speakersData = values[3];
            let speakersIXData = values[4];

            // if null , then set the SSR content
            // summit
            if (summitData && summitData?.file){
                if(summitData.lastModified > lastModified)
                    lastModified = summitData.lastModified;
                summitData = summitData.file;
            }
            else
                summitData = summitBuildJson;
            // events
            if (eventsData && eventsData?.file){
                if(eventsData.lastModified > lastModified)
                    lastModified = eventsData.lastModified;
                eventsData = eventsData.file;
            }
            else
                eventsData = eventsBuildJson;
            // events idx
            if (eventsIDXData && eventsIDXData?.file){
                if(eventsIDXData.lastModified > lastModified)
                    lastModified = eventsIDXData.lastModified;
                eventsIDXData = eventsIDXData.file;
            }
            else
                eventsIDXData = eventsIDXBuildJson;
            // speakers
            if (speakersData && speakersData?.file){
                if(speakersData.lastModified > lastModified)
                    lastModified = speakersData.lastModified;
                speakersData = speakersData.file;
            }
            else
                speakersData = speakersBuildJson;
            // speakers idx
            if (speakersIXData && speakersIXData?.file){
                if(speakersIXData.lastModified > lastModified)
                    lastModified = speakersIXData.lastModified;
                speakersIXData = speakersIXData.file;
            }
            else
                speakersIXData = speakersIDXBuildJson;
            

            /* eslint-disable-next-line no-restricted-globals */
            self.postMessage({
                eventsData, summitData, speakersData, eventsIDXData, speakersIXData,lastModified
            });
        });

};