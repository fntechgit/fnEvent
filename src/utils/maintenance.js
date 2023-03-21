import maintenanceMode from '../content/maintenance.json';

export const checkMaintenanceMode = () => {
    if (maintenanceMode.enabled && window.location.pathname !== '/maintenance/') {
        window.location = '/maintenance/';
    }
};