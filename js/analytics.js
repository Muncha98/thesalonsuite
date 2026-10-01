/**
 * TheSalonSuite.com — Privacy-Conscious Station Analytics & DataLayer Hooks
 * Strictly logs anonymized professional interaction events without transmitting
 * sensitive calculation values or personal client data.
 */

(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SalonAnalytics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  function pushEvent(eventName, payload) {
    const data = Object.assign({
      event: eventName,
      timestamp: new Date().toISOString()
    }, payload);

    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(data);

      if (window.location && (window.location.hostname === 'localhost' || window.location.search.includes('debug=analytics'))) {
        console.log(`[SalonAnalytics] ${eventName}:`, data);
      }
    }
    return data;
  }

  const SalonAnalytics = {
    track: function(eventName, payload) {
      return pushEvent(eventName, payload || {});
    },

    // 1. Tool Interaction Started (first input change)
    trackToolStarted: function(toolId, category) {
      return pushEvent('tool_started', {
        tool_id: toolId,
        category: category
      });
    },

    // 2. Successful Result Generated (no raw numbers logged)
    trackResultGenerated: function(toolId, unitMode, region, currency) {
      return pushEvent('result_generated', {
        tool_id: toolId,
        unit_mode: unitMode,
        region: region,
        currency: currency
      });
    },

    // 3. User Copied Recipe to Clipboard
    trackResultCopied: function(toolId) {
      return pushEvent('result_copied', {
        tool_id: toolId
      });
    },

    // 4. Unit Toggled (Metric vs Imperial)
    trackUnitToggled: function(prevUnit, newUnit) {
      return pushEvent('unit_toggled', {
        previous_unit: prevUnit,
        new_unit: newUnit
      });
    },

    // 5. Region Changed (US vs UK)
    trackCountryChanged: function(prevRegion, newRegion) {
      return pushEvent('country_changed', {
        previous_region: prevRegion,
        new_region: newRegion
      });
    },

    // 6. Related Tool Clicked
    trackRelatedToolClicked: function(fromToolId, toToolId) {
      return pushEvent('related_tool_clicked', {
        from_tool: fromToolId,
        to_tool: toToolId
      });
    },

    // 7. Free Lead Magnet Resource Clicked
    trackResourceClicked: function(toolId, resourceSlug) {
      return pushEvent('resource_clicked', {
        tool_id: toolId,
        resource_slug: resourceSlug
      });
    },

    // 8. Contextual Sponsor / Affiliate Clicked
    trackAffiliateClicked: function(toolId, sponsorName, targetUrl) {
      return pushEvent('affiliate_clicked', {
        tool_id: toolId,
        sponsor_name: sponsorName,
        target_domain: targetUrl ? (new URL(targetUrl, window.location.origin)).hostname : 'unknown'
      });
    }
  };

  return SalonAnalytics;
});
