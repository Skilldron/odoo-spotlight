/** @odoo-module **/

import { spotlightSectionsRegistry } from "../../spotlight_service";
import { _t } from "@web/core/l10n/translation";
import { formatMonetary } from "@web/views/fields/formatters";
import { formatDate } from "@web/core/l10n/dates";
import { deserializeDate } from "@web/core/l10n/dates";

export const PurchaseOrderSpotlightProvider = {
  id: "purchase_order",
  model: "purchase.order",

  label: _t("Purchases"),
  icon: "/purchase/static/description/icon.png",
  priority: 60,

  fields: [
    "name",
    "state",
    "partner_id",
    "date_order",
    "amount_total",
    "currency_id",
    "user_id",
  ],

  ItemContentTemplate: "odoo_spotlight.PurchaseOrderItemContent",

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
    const fields = await env.services.orm.call("purchase.order", "fields_get");
    const getSelection = (state_value) =>
      fields.state.selection.find((e) => e[0] == state_value)?.[1];

    return {
      id: record.id,
      name: record.name,
      state: record.state,
      stateLabel: _t(getSelection(record.state)),
      partner: record.partner_id[1],
      idPartner: record.partner_id[0],
      date: record.date_order
        ? formatDate(deserializeDate(record.date_order.split(" ")[0]), { env })
        : null,
      amount: formatMonetary(record.amount_total, {
        currencyId: record.currency_id[0],
      }),
      buyer: record.user_id[1],
      idBuyer: record.user_id[0],
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

  getQuickActions({ env, record, model, doAction }) {
    const actions = [];

    if (record.state === "draft") {
      actions.push({
        id: "confirm_purchase",
        label: _t("Confirm order"),
        icon: "fa-check",
        isDestructive: false,
        async execute() {
          await env.services.orm.call(model, "button_confirm", [[record.id]]);
        },
      });
    }

    if (record.state === "purchase" || record.state === "done") {
      actions.push({
        id: "open_vendor",
        label: _t("Open vendor"),
        icon: "fa-building",
        isDestructive: false,
        async execute() {
          await doAction({
            type: "ir.actions.act_window",
            res_model: "res.partner",
            res_id: record.partner_id[0],
            views: [[false, "form"]],
            target: "current",
          });
        },
      });
    }

    return actions;
  },
};

spotlightSectionsRegistry.add(
  PurchaseOrderSpotlightProvider.id,
  PurchaseOrderSpotlightProvider,
);
