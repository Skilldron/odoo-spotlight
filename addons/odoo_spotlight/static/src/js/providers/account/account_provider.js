/** @odoo-module **/

import { spotlightSectionsRegistry } from "../../spotlight_service";
import { _t } from "@web/core/l10n/translation";
import { formatMonetary } from "@web/views/fields/formatters";
import { formatDate } from "@web/core/l10n/dates";
import { deserializeDate } from "@web/core/l10n/dates";

export const AccountSpotlightProvider = {
  id: "account",
  model: "account.move",

  label: _t("Invoices"),
  icon: "/account/static/description/icon.png",
  priority: 30,

  fields: [
    "name",
    "state",
    "invoice_date",
    "partner_id",
    "status_in_payment",
    "amount_total",
    "currency_id",
  ],

  ItemContentTemplate: "odoo_spotlight.AccountItemContent",

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
    const fields = await env.services.orm.call("account.move", "fields_get");
    const getSelection = (state_value) =>
      fields.status_in_payment.selection.find((e) => e[0] == state_value)[1];

    return {
      id: record.id,
      email: record.email,
      name: record.name,
      customer: record.partner_id[1],
      idCustomer: record.partner_id[0],
      invoiceDate: formatDate(deserializeDate(record.invoice_date), { env }),
      paymentState: record.status_in_payment,
      paymentStateLabel: _t(getSelection(record.status_in_payment)),
      amountTotal: formatMonetary(record.amount_total, {
        currencyId: record.currency_id[0],
      }),
      state: record.state,
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
        id: "validate_invoice",
        label: _t("Validate invoice"),
        icon: "fa-check",
        isDestructive: false,
        async execute() {
          await env.services.orm.call(model, "action_post", [[record.id]]);
        },
      });
    }

    if (record.partner_id && record.partner_id[0]) {
      actions.push({
        id: "open_customer",
        label: _t("Open customer"),
        icon: "fa-user",
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
  AccountSpotlightProvider.id,
  AccountSpotlightProvider,
);
