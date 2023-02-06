import { navigate } from "gatsby";

const expiredToken = function (err) {

  if(typeof window !== 'undefined') {
    let currentLocation = window.location.href;
    return navigate('/auth/expired', {
      state: {
        backUrl: currentLocation,
      },
    });
  }
}

export default expiredToken