/** @odoo-module **/

import { spotlightSectionsRegistry } from "../../spotlight_service";
import { _t } from "@web/core/l10n/translation";
import { formatMonetary } from "@web/views/fields/formatters";

export const ProductSpotlightProvider = {
  id: "product",
  model: "product.product",

  label: _t("Products"),
  icon: "/product/static/description/icon.png",
  priority: 40,

  fields: [
    "name",
    "list_price",
    "currency_id",
    "type",
    "categ_id",
    "active",
    "default_code",
    "product_tmpl_id",
  ],

  ItemContentTemplate: "odoo_spotlight.ProductItemContent",

  domain(query) {
    return [
      "|",
      "|",
      ["name", "ilike", query],
      ["default_code", "ilike", query],
      ["categ_id.name", "ilike", query],
    ];
  },

  async serialize(record, env) {
    const fields = await env.services.orm.call("product.product", "fields_get");
    const getSelection = (type_value) =>
      fields.type.selection.find((e) => e[0] == type_value)?.[1];

    return {
      id: record.id,
      templateId: record.product_tmpl_id[0],
      name: record.name,
      internalRef: record.default_code || null,
      category: record.categ_id[1],
      type: record.type,
      typeLabel: _t(getSelection(record.type)),
      price: formatMonetary(record.list_price, {
        currencyId: record.currency_id[0],
      }),
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

    if (record.active !== false) {
      actions.push({
        id: "archive_product",
        label: _t("Archive"),
        icon: "fa-archive",
        isDestructive: true,
        async execute() {
          await env.services.orm.call(model, "write", [[record.id], { active: false }]);
        },
      });
    }

    return actions;
  },
};

spotlightSectionsRegistry.add(
  ProductSpotlightProvider.id,
  ProductSpotlightProvider,
);
