/** @odoo-module **/
import { spotlightSectionsRegistry } from "../../spotlight_service";
import { _t } from "@web/core/l10n/translation";
import { formatMonetary } from "@web/views/fields/formatters";

export const SaleOrderSpotlightProvider = {
  id: "sale_order",
  model: "sale.order",

  label: _t("Sales"),
  icon: "/sale_management/static/description/icon.png",
  priority: 20,

  fields: [
    "name",
    "amount_total",
    "state",
    "partner_id",
    "date_order",
    "user_id",
    "currency_id",
  ],
  ItemContentTemplate: "odoo_spotlight.SaleOrderItemContent",

  domain(query) {
    return [
      "|",
      "|",
      ["name", "ilike", query],
      ["partner_id.name", "ilike", query],
      ["partner_id.email", "ilike", query],
    ];
  },

  async serialize(record, env) {
    const fields = await env.services.orm.call("sale.order", "fields_get");
    const getSelection = (state_value) =>
      fields.state.selection.find((e) => e[0] == state_value)[1];

    return {
      id: record.id,
      name: record.name,
      amount: formatMonetary(record.amount_total, {
        currencyId: record.currency_id[0],
      }),
      state: record.state,
      stateLabel: _t(getSelection(record.state)),
      partner: record.partner_id[1],
      date: record.date_order,
      salesperson: record.user_id[1],
      id_salesperson: record.user_id[0],
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
  SaleOrderSpotlightProvider.id,
  SaleOrderSpotlightProvider
);
