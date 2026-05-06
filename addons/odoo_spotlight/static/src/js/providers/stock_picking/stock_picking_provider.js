/** @odoo-module **/

import { spotlightSectionsRegistry } from "../../spotlight_service";
import { _t } from "@web/core/l10n/translation";
import { formatDate } from "@web/core/l10n/dates";
import { deserializeDate } from "@web/core/l10n/dates";

export const StockPickingSpotlightProvider = {
  id: "stock_picking",
  model: "stock.picking",

  label: _t("Inventory"),
  icon: "/stock/static/description/icon.png",
  priority: 50,

  fields: [
    "name",
    "state",
    "partner_id",
    "scheduled_date",
    "picking_type_id",
    "origin",
  ],

  ItemContentTemplate: "odoo_spotlight.StockPickingItemContent",

  domain(query) {
    return [
      "|",
      "|",
      ["name", "ilike", query],
      ["partner_id.name", "ilike", query],
      ["origin", "ilike", query],
    ];
  },

  async serialize(record, env) {
    const fields = await env.services.orm.call("stock.picking", "fields_get");
    const getSelection = (state_value) =>
      fields.state.selection.find((e) => e[0] == state_value)?.[1];

    return {
      id: record.id,
      name: record.name,
      state: record.state,
      stateLabel: _t(getSelection(record.state)),
      partner: record.partner_id ? record.partner_id[1] : null,
      idPartner: record.partner_id ? record.partner_id[0] : null,
      scheduledDate: record.scheduled_date
        ? formatDate(deserializeDate(record.scheduled_date.split(" ")[0]), { env })
        : null,
      scheduledDateClass: (() => {
        if (!record.scheduled_date) return "";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(record.scheduled_date.split(" ")[0]);
        date.setHours(0, 0, 0, 0);
        if (date < today) return "text-danger";
        if (date.getTime() === today.getTime()) return "text-warning";
        return "";
      })(),
      pickingType: record.picking_type_id[1],
      origin: record.origin || null,
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

    if (record.state === "assigned") {
      actions.push({
        id: "validate_picking",
        label: _t("Validate"),
        icon: "fa-check",
        isDestructive: false,
        async execute() {
          const action = await env.services.orm.call(
            model,
            "button_validate",
            [[record.id]],
          );
          if (action && typeof action === "object") {
            await doAction(action);
          }
        },
      });
    }

    if (record.state === "draft") {
      actions.push({
        id: "confirm_picking",
        label: _t("Check availability"),
        icon: "fa-search",
        isDestructive: false,
        async execute() {
          await env.services.orm.call(model, "action_confirm", [[record.id]]);
          await env.services.orm.call(model, "action_assign", [[record.id]]);
        },
      });
    }

    return actions;
  },
};

spotlightSectionsRegistry.add(
  StockPickingSpotlightProvider.id,
  StockPickingSpotlightProvider,
);
