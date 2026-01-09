/** @odoo-module **/

import { Component } from "@odoo/owl";

export class SaleOrderItemContent extends Component {
  static template = "odoo_spotlight.SaleOrderItemContent";
  static props = { item: Object };
}
