/** @odoo-module **/

import { spotlightProviderRegistry } from "../../spotlight_provider_registry";
import { _t } from "@web/core/l10n/translation";

export const ResPartnerSpotlightProvider =  {
  name: "res_partner",
  section: _t("Partners"),
  icon: "/contacts/static/description/icon.png",
  priority: 10,
  fetch_fields: ["name", "email", "is_company", "phone", "mobile", "city", "country_id"],
  ItemContentTemplate: "odoo_spotlight.ResPartnerItemContent",

  async search(env, query) {
    if (!query || query.length < 2) {
      return [];
    }

    const partners = await env.services.orm.searchRead(
      "res.partner",
      ["|", ["name", "ilike", query], ["email", "ilike", query]],
      this.fetch_fields,
      { limit: 5 }
    );

    console.log(partners);


    return partners.map((p) => ({
      __provider: this.ItemContentTemplate,
      __index: null,
      id: p.id,
      email: p.email,
      name: p.name,
      is_company: p.is_company,
      phone: p.phone,
      mobile: p.mobile,
      city: p.city,
      country: p.country_id[1],
      // avatar: p.avatar_128,
      action: ({ openInDialog }) =>
        env.services.action.doAction({
          type: "ir.actions.act_window",
          res_model: "res.partner",
          res_id: p.id,
          views: [[false, "form"]],
          target: openInDialog ? "new" : "current",
        }),
    }));
  },
}

spotlightProviderRegistry.add("res_partner", ResPartnerSpotlightProvider);
