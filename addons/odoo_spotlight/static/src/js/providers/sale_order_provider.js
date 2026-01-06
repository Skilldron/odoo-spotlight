/** @odoo-module **/

import { spotlightProviderRegistry } from "../spotlight_provider_registry";

spotlightProviderRegistry.add("sale_order", {
  section: "Sales",
  icon: "/sale_management/static/description/icon.png",
  priority: 20,

  async search(env, query) {
    if (!query || query.length < 2) {
      return [];
    }

    const orders = await env.services.orm.searchRead(
      "sale.order",
      ["|", ["name", "ilike", query], ["partner_id.name", "ilike", query]],
      ["name", "amount_total", "state"],
      { limit: 5 }
    );

    return orders.map((o) => ({
      title: o.name,
      subtitle: `€${o.amount_total} – ${o.state}`,
      action: () =>
        env.services.action.doAction({
          type: "ir.actions.act_window",
          res_model: "sale.order",
          res_id: o.id,
          views: [[false, "form"]],
        }),
    }));
  },
});
