/** @odoo-module **/

import { Component } from "@odoo/owl";

export class SpotlightItemBase extends Component {
  static template = "odoo_spotlight.ItemBase";
  static props = {
    item: Object,
    activeIndex: Number,
    ItemContentTemplate: String,
  };

  onClick() {
    this.props.item.action({ openInDialog: false });
  }
}
