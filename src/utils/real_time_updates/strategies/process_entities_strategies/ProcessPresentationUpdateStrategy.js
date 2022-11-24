import AbstractProcessEntityUpdateStrategy from "./AbstractProcessEntityUpdateStrategy";
import {getPublicEventById} from "../../../../actions/event-actions";;


class ProcessPresentationUpdateStrategy extends AbstractProcessEntityUpdateStrategy{

    process(payload){

        const {
            created_at,
            entity_id,
            entity_operator,
            entity_type,
            summit_id
        } = payload;

        const { synchEntityData } = this.props;

        if(entity_operator === 'UPDATE' || entity_operator === 'INSERT'){
            getPublicEventById(entity_id).then((entity) =>{
                console.log('ProcessPresentationUpdateStrategy::process', entity);
                synchEntityData(payload, entity);
            })
        }
    }
}

export default ProcessPresentationUpdateStrategy;