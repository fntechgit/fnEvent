export const IDP_BASE_URL = 'IDP_BASE_URL';
export const SUMMIT_API_BASE_URL = 'SUMMIT_API_BASE_URL';
export const SUMMIT_ID = 'SUMMIT_ID';
export const OAUTH2_CODE = 'OAUTH2_CODE';
export const OAUTH2_CLIENT_ID = 'OAUTH2_CLIENT_ID';
export const SCOPES = 'SCOPES';
export const MARKETING_API_BASE_URL = 'MARKETING_API_BASE_URL';
export const REGISTRATION_BASE_URL = 'REGISTRATION_BASE_URL';
export const AUTHZ_USER_GROUPS = 'AUTHZ_USER_GROUPS';
export const AUTHORIZED_DEFAULT_PATH = 'AUTHORIZED_DEFAULT_PATH';
export const STREAM_IO_API_KEY = 'STREAM_IO_API_KEY';
export const MUX_ENV_KEY = 'MUX_ENV_KEY';
export const DISQUS_SHORTNAME = 'DISQUS_SHORTNAME';
export const SUPABASE_URL = 'SUPABASE_URL';
export const SUPABASE_KEY = 'SUPABASE_KEY';
export const CHAT_API_BASE_URL = 'CHAT_API_BASE_URL';
export const SCHEDULE_EXCLUDING_TAGS = 'SCHEDULE_EXCLUDING_TAGS';
export const LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS = 'LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS';
export const OAUTH2_FLOW = 'OAUTH2_FLOW';
export const API_BASE_URL = 'API_BASE_URL';
export const SUPPORT_EMAIL = 'SUPPORT_EMAIL';

const processEnv = {
    IDP_BASE_URL: process.env.GATSBY_IDP_BASE_URL,
    SUMMIT_API_BASE_URL: process.env.GATSBY_SUMMIT_API_BASE_URL,
    API_BASE_URL: process.env.GATSBY_SUMMIT_API_BASE_URL,
    SUMMIT_ID: process.env.GATSBY_SUMMIT_ID,
    OAUTH2_FLOW: process.env.GATSBY_OAUTH2_FLOW,
    OAUTH2_CLIENT_ID: process.env.GATSBY_OAUTH2_CLIENT_ID,
    SCOPES: process.env.GATSBY_SCOPES,
    MARKETING_API_BASE_URL: process.env.GATSBY_MARKETING_API_BASE_URL,
    REGISTRATION_BASE_URL: process.env.GATSBY_REGISTRATION_BASE_URL,
    AUTHZ_USER_GROUPS: process.env.GATSBY_AUTHZ_USER_GROUPS,
    AUTHORIZED_DEFAULT_PATH: process.env.GATSBY_AUTHORIZED_DEFAULT_PATH,
    STREAM_IO_API_KEY: process.env.GATSBY_STREAM_IO_API_KEY,
    MUX_ENV_KEY: process.env.GATSBY_MUX_ENV_KEY,
    DISQUS_SHORTNAME: process.env.GATSBY_DISQUS_SHORTNAME,
    SUPABASE_URL: process.env.GATSBY_SUPABASE_URL,
    SUPABASE_KEY: process.env.GATSBY_SUPABASE_KEY,
    CHAT_API_BASE_URL: process.env.GATSBY_CHAT_API_BASE_URL,
    SCHEDULE_EXCLUDING_TAGS: process.env.GATSBY_SCHEDULE_EXCLUDING_TAGS,
    LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS: process.env.GATSBY_LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS || 60,
    SUPPORT_EMAIL: process.env.GATSBY_SUPPORT_EMAIL
}

export const getEnvVariable = (name) => {
    let res = typeof window === 'object' ? window[name] : null;
    if (!res) {
        res = processEnv[name];
    }
    return res;
}

if (typeof window === 'object') {
    window.OAUTH2_FLOW = processEnv[OAUTH2_FLOW];
    window.OAUTH2_CLIENT_ID = processEnv[OAUTH2_CLIENT_ID];
    window.SCOPES = processEnv[SCOPES];
    window.IDP_BASE_URL = processEnv[IDP_BASE_URL];
    window.SUMMIT_API_BASE_URL = processEnv[SUMMIT_API_BASE_URL];
    window.API_BASE_URL = processEnv[API_BASE_URL];
    window.SUMMIT_ID = processEnv[SUMMIT_ID];
    window.MARKETING_API_BASE_URL = processEnv[MARKETING_API_BASE_URL];
    window.REGISTRATION_BASE_URL = processEnv[REGISTRATION_BASE_URL];
    window.AUTHZ_USER_GROUPS = processEnv[AUTHZ_USER_GROUPS];
    window.AUTHORIZED_DEFAULT_PATH = processEnv[AUTHORIZED_DEFAULT_PATH];
    window.STREAM_IO_API_KEY = processEnv[STREAM_IO_API_KEY];
    window.MUX_ENV_KEY = processEnv[MUX_ENV_KEY];
    window.DISQUS_SHORTNAME = processEnv[DISQUS_SHORTNAME];
    window.SUPABASE_URL = processEnv[SUPABASE_URL];
    window.SUPABASE_KEY = processEnv[SUPABASE_KEY];
    window.CHAT_API_BASE_URL = processEnv[CHAT_API_BASE_URL];
    window.SCHEDULE_EXCLUDING_TAGS = processEnv[SCHEDULE_EXCLUDING_TAGS];
    window.LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS = processEnv[LIVE_EVENT_THUMBNAIL_GIF_CAPTURE_STARTS];
    window.SUPPORT_EMAIL = processEnv[SUPPORT_EMAIL];
}
