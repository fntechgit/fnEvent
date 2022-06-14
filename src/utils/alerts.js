import Swal from "sweetalert2";
import { doLogin } from 'openstack-uicore-foundation/lib/security/methods'
import URI from "urijs"
import { savePendingAction } from "./schedule";

export const alertPopup = (title, html, confirmLabel, confirmAction, cancelLabel = 'Dismiss') => {
    Swal.fire({
            title,
            html,
            icon: 'question',
            iconHtml: '!',
            showCancelButton: true,
            confirmButtonText: confirmLabel,
            cancelButtonText: cancelLabel,
            width: '400px',
            reverseButtons: true,
            customClass: {
                container: 'swal-wrapper',
                title: 'swal-title',
                icon: 'swal-icon',
                content: 'swal-body',
                confirmButton: 'swal-confirm',
                cancelButton: 'swal-cancel',
            }
        }
    ).then((result) => {
        if (result.value) {
            confirmAction();
        }
    })
};


export const needsLogin = (action, msg = null) => {
    const defaultMessage = "Please log in to add sessions to My Schedule.";

    const login = () => {
        let backUrl = window?.location?.href ?? '/a';
        let encodedBackUrl = URI.encode(backUrl);
        if (action) savePendingAction(action);
        return doLogin(encodedBackUrl);
    }

    alertPopup('Login', msg || defaultMessage, 'Login', login, 'OK');
};