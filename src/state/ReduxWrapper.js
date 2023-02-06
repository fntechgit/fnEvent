import React  from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store";

import { RESET_STATE } from "../actions/base-actions-definitions";

const onBeforeLift = () => {
    const params = new URLSearchParams(window.location.search);
    const flush = params.has("flushState");

    if (flush) {
        store.dispatch({ type: RESET_STATE, payload: null });
    }
};

export default ({ element }) => (
    <Provider store={store}>
        <PersistGate onBeforeLift={onBeforeLift} persistor={persistor}>
            {element}
        </PersistGate>
    </Provider>
);
