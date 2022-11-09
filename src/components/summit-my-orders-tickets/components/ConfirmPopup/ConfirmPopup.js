/**
 * Copyright 2022
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React from 'react'
import { useTranslation } from "react-i18next";
import usePortal from 'react-useportal';

import './confirm-popup.scss';

export const CONFIRM_POPUP_CASE = {
    CANCEL_ORDER: 'CANCEL_ORDER',
    CANCEL_TICKET: 'CANCEL_TICKET',
    ASSIGN_TICKET: 'ASSIGN_TICKET',
    REASSIGN_TICKET: 'REASSIGN_TICKET',
    UNASSIGN_TICKET: 'UNASSIGN_TICKET',
    SAVE: 'SAVE',
    NOTIFICATION: 'NOTIFICATION',
}

export const getConfirmPopupContent = ({ popupCase, cleanFields }) => {
    const popupCaseContentMap = {
        [CONFIRM_POPUP_CASE.CANCEL_ORDER]: {
            title: 'confirm_popup.question_title_cancel_order',
            text: 'confirm_popup.question_text_cancel_order'
        },
        [CONFIRM_POPUP_CASE.CANCEL_TICKET]: {
            title: 'confirm_popup.question_title_cancel',
            text: "confirm_popup.question_text_cancel"
        },
        [CONFIRM_POPUP_CASE.ASSIGN_TICKET]: {
            title: 'confirm_popup.question_title_assign',
            text: 'confirm_popup.question_text_assign'
        },
        [CONFIRM_POPUP_CASE.REASSIGN_TICKET]: {
            title: 'confirm_popup.question_title_reassign',
            text: cleanFields ? 'confirm_popup.question_text_reassign' : 'confirm_popup.question_text_confirm'
        },
        [CONFIRM_POPUP_CASE.UNASSIGN_TICKET]: {
            title: 'confirm_popup.question_title_unassign',
            text: 'confirm_popup.question_text_unassign'
        },
        [CONFIRM_POPUP_CASE.SAVE]: {
            title: 'confirm_popup.question_title_save',
            text: 'confirm_popup.question_text_save'
        },
        [CONFIRM_POPUP_CASE.NOTIFICATION]: {
            title: 'confirm_popup.question_title_notification',
            text: 'confirm_popup.question_text_notification'
        }
    };

    return popupCaseContentMap[popupCase];
};

export const ConfirmPopup = ({ isOpen, popupCase, onAccept, onReject, cleanFields }) => {
    var { Portal } = usePortal();
    const { t } = useTranslation();
    const content = getConfirmPopupContent({ popupCase, cleanFields });

    const handleAcceptClick = () => {
        if (onAccept) onAccept();
    };

    const handleRejectClick = () => {
        if (onReject) onReject();
    };

    return (
        <>
            {isOpen && (
                <Portal>
                    <div className="confirm-popup-bg">
                        <div className="confirm-popup">
                            <h4>{t(content.title)}</h4>
                            <p>{t(content.text)}</p>

                            <div className="buttons">
                                <span onClick={handleRejectClick}>{t("confirm_popup.cancel")}</span>
                                <span onClick={handleAcceptClick}>{t("confirm_popup.accept")}</span>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
};