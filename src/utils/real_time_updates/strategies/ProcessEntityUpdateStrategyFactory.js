import ProcessPresentationUpdateStrategy from "./process_entities_strategies/ProcessPresentationUpdateStrategy";


class ProcessEntityUpdateStrategyFactory {

    /**
     * @param props
     * @param payload
     * @returns {ProcessPresentationUpdateStrategy|null}
     */
    static build(props, payload){
        const {
            created_at,
            entity_id,
            entity_operator,
            entity_type,
            summit_id
        } = payload;

        switch (entity_type){
            case 'Presentation':
                return new ProcessPresentationUpdateStrategy(props);
        }
        return null;
    }
}

export default ProcessEntityUpdateStrategyFactory;