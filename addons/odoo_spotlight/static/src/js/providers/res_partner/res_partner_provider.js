/** @odoo-module **/

import { spotlightSectionsRegistry } from "../../spotlight_service";
import { _t } from "@web/core/l10n/translation";

export const ResPartnerSpotlightProvider = {
  id: "res_partner",
  model: "res.partner",

  label: _t("Partners"),
  icon: "/contacts/static/description/icon.png",
  priority: 10,

  fields: [
    "name",
    "email",
    "is_company",
    "phone",
    "mobile",
    "city",
    "country_id",
  ],

  ItemContentTemplate: "odoo_spotlight.ResPartnerItemContent",

  domain(query) {
    return ["|", ["name", "ilike", query], ["email", "ilike", query]];
  },

  serialize(record, env) {
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      is_company: record.is_company,
      phone: record.phone,
      mobile: record.mobile,
      city: record.city,
      country: record.country_id?.[1],
    };
  },

  action(doAction, recordId, model, { openInDialog }) {
    return doAction({
      type: "ir.actions.act_window",
      res_model: model,
      res_id: recordId,
      views: [[false, "form"]],
      target: openInDialog ? "new" : "current",
    });
  },
};

spotlightSectionsRegistry.add(
  ResPartnerSpotlightProvider.id,
  ResPartnerSpotlightProvider
);
