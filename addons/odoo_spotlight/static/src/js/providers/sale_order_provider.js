/** @odoo-module **/
import { spotlightProviderRegistry } from "../spotlight_provider_registry";
import { _t } from "@web/core/l10n/translation";

export const SaleOrderSpotlightProvider = {
  name: "sale_order",
  section: _t("Sales"),
  icon: "/sale_management/static/description/icon.png",
  priority: 20,

  async search(env, query) {
    if (!query || query.length < 2) {
      return [];
    }

    const fields = await env.services.orm.call("sale.order", "fields_get");
    const getSelection = (state_value) => fields.state.selection.find(e => e[0] == state_value)[1]


    const orders = await env.services.orm.searchRead(
      "sale.order",
      ["|", ["name", "ilike", query], ["partner_id.name", "ilike", query]],
      ["name", "amount_total", "state", "partner_id"],
      { limit: 5 }
    );

    return orders.map((o) => ({
      title: `${o.name} - ${o.partner_id[1]}`,
      subtitle: `€${o.amount_total} – ${_t(getSelection(o.state))}`,
      action: ({ openInDialog }) =>
        env.services.action.doAction({
          type: "ir.actions.act_window",
          res_model: "sale.order",
          res_id: o.id,
          views: [[false, "form"]],
          target: openInDialog ? "new" : "current",
        }),
    }));
  },
}

spotlightProviderRegistry.add("sale_order", SaleOrderSpotlightProvider);
