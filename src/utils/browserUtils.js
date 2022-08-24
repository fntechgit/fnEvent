export const getBrowserVisibilityProp = function () {
   return "visibilitychange";
}

export const getIsDocumentHidden = function () {
    return document.visibilityState === 'hidden'
}