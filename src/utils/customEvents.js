export const onInitLogoutEvent = 'site_logout';

export const triggerOnInitLogout = () => {
    if(typeof window !== 'undefined') {
        const event = new Event(onInitLogoutEvent);
        window.dispatchEvent(event);
    }
}