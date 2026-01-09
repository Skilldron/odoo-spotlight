/** @odoo-module **/
import { spotlightProviderRegistry } from "../../spotlight_provider_registry";
import { _t } from "@web/core/l10n/translation";
import { formatMonetary } from "@web/views/fields/formatters";

export const SaleOrderSpotlightProvider = {
  name: "sale_order",
  section: _t("Sales"),
  icon: "/sale_management/static/description/icon.png",
  priority: 20,
  fetch_fields: ["name", "amount_total", "state", "partner_id", "date_order", "user_id", "currency_id"],
  ItemContentTemplate: "odoo_spotlight.SaleOrderItemContent",

  async search(env, query) {
    if (!query || query.length < 2) {
      return [];
    }

    const fields = await env.services.orm.call("sale.order", "fields_get");
    const getSelection = (state_value) => fields.state.selection.find(e => e[0] == state_value)[1]

    const orders = await env.services.orm.searchRead(
      "sale.order",
      ["|", "|", ["name", "ilike", query], ["partner_id.name", "ilike", query], ["partner_id.email", "ilike", query]],
      this.fetch_fields,
      { limit: 5 }
    );

    return orders.map((o) => ({
      __provider: this.ItemContentTemplate,
      __index: null,
      name: o.name,
      amount: formatMonetary(o.amount_total, { currencyId: o.currency_id[0] }),
      state: o.state,
      stateLabel: _t(getSelection(o.state)),
      partner: o.partner_id[1],
      date: o.date_order,
      salesperson: o.user_id[1],
      id_salesperson: o.user_id[0],
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
