
onmessage = async ({ data: { payload, entity, summit, allEvents, allIDXEvents } }) =>  {

    console.log(`synch worker running for ${summit.id} ....`)

    const {entity_operator,  entity_type} = payload;
    // micro updates logic goes here ...
    if(entity_type === 'Presentation') {
        if (entity_operator === 'UPDATE') {
            const idx = allIDXEvents[entity.id];
            let eventsData = [...allEvents]
            console.log(`synch worker updating presentation ${entity.id}`)
            eventsData[idx] = entity;
            postMessage({
                eventsData
            });
        }
    }
};