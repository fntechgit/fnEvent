import { getEnvVariable, AUTHORIZED_DEFAULT_PATH } from './envVariables'

export const getDefaultLocation = (eventRedirect) => {
    return eventRedirect ? `/a/event/${eventRedirect}` : getEnvVariable(AUTHORIZED_DEFAULT_PATH) ? getEnvVariable(AUTHORIZED_DEFAULT_PATH) : '/a/';
}