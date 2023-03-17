export const checkMaintenanceMode = () => {
    if (process.env.GATSBY_SITE_MODE === 'MAINTENANCE' && window.location.pathname !== '/maintenance') {
        window.location = '/maintenance';
    }
};