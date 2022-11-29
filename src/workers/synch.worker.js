import { insertSorted, intCheck } from "../utils/arrayUtils";

onmessage = async ({ data: { payload, entity, summit, allEvents, allIDXEvents } }) =>  {

    payload = JSON.parse(payload);
    entity = JSON.parse(entity);
    summit = JSON.parse(summit);
    allEvents = JSON.parse(allEvents);
    allIDXEvents = JSON.parse(allIDXEvents);

    console.log(`synch worker running for ${summit.id} ....`)

    const {entity_operator,  entity_type} = payload;

    // micro updates logic goes here ...
    if(entity_type === 'Presentation') {
        if (entity_operator === 'UPDATE') {
            // try to get from index
            const idx =  allIDXEvents.hasOwnProperty(entity.id) ? allIDXEvents[entity.id] : -1;
            if(idx < 0) return; // does not exists ...

            let eventsData = [...allEvents];
            let formerEntity = eventsData[idx];
            if(formerEntity.id !== entity.id) return; // it's not the same

            if
            (
                formerEntity.start_date === entity.start_date &&
                formerEntity.end_date === entity.end_date
            ) {
                console.log(`synch worker updating presentation ${entity.id}`)
                eventsData[idx] = entity;
            }
            else{
                // publishing dates changed, we need to remove and do ordered re-insert
                // remove it first
                eventsData.splice(idx, 1);
                // then do insert ordering
                allIDXEvents[entity.id] = insertSorted(eventsData, entity, (a, b) => {
                    // multi-criteria sort

                    if(a.start_date === b.start_date){

                        if(a.end_date === b.end_date){
                            return intCheck(a.id, b.id);
                        }

                        return intCheck(a.end_date, b.end_date);
                    }

                    return intCheck(a.start_date, b.start_date);
                });
            }

            postMessage({
                eventsData,
                allIDXEvents
            });
        }
    }
};