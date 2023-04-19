import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";

export const MARKETING_SETTINGS_KEYS = {
  disqusThreadsBy: "disqus_threads_by",
  disqusExcludeEvents: "disqus_exclude_events",
  disqusExcludeTracks: "disqus_exclude_tracks",
  registrationInPersonDisclaimer: "registration_in_person_disclaimer",
  scheduleDefaultImage: "schedule_default_image",
  summitDeltaStartTime: "summit_delta_start_time",
  activityCtaText: "ACTIVITY_CTA_TEXT",
  regLiteAllowPromoCodes: "REG_LITE_ALLOW_PROMO_CODES",
  regLiteCompanyInputPlaceholder: "REG_LITE_COMPANY_INPUT_PLACEHOLDER",
  regLiteCompanyDDLPlaceholder: "REG_LITE_COMPANY_DDL_PLACEHOLDER"
}

const marketingSettingsQuery = graphql`
  query {
    allMarketingSettingsJson {
      nodes {
        key
        value
      }
    }
  }
`;

const useMarketingSettings = () => {
  const { allMarketingSettingsJson } = useStaticQuery(marketingSettingsQuery);
  const getSettingByKey = (key) =>
    allMarketingSettingsJson.nodes.find(setting => setting.key === key)?.value;
  return { MARKETING_SETTINGS_KEYS, getSettingByKey };
};

export default useMarketingSettings;

// HOC for use on class based components 
export const withMarketingSettings = (Component) => (
  (props) => {
    const {
      MARKETING_SETTINGS_KEYS,
      getSettingByKey
    } = useMarketingSettings();
    return (
      <Component
        {...props}
        MARKETING_SETTINGS_KEYS={MARKETING_SETTINGS_KEYS}
        getMarketingSettingByKey={getSettingByKey}
      />
    );
  }
);