/** @odoo-module **/

import { spotlightProviderRegistry } from "../spotlight_provider_registry";
import { _t } from "@web/core/l10n/translation";

export const ResPartnerSpotlightProvider =  {
  name: "res_partner",
  section: _t("Partners"),
  icon: "/contacts/static/description/icon.png",
  priority: 10,

  async search(env, query) {
    if (!query || query.length < 2) {
      return [];
    }

    const partners = await env.services.orm.searchRead(
      "res.partner",
      [["name", "ilike", query]],
      ["name", "email", "is_company"],
      { limit: 5 }
    );

    return partners.map((p) => ({
      title: p.name,
      subtitle: p.email || (p.is_company ? _t("Company") : _t("Contact")),
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
