import { Component } from "@odoo/owl";
import { SpotlightItemBase } from "./spotlight_item_base";
export class SpotlightSection extends Component {
  static template = "odoo_spotlight.SpotlightSection";
  static components = { SpotlightItemBase };
  static props = {
    title: String,
    icon: String,
    items: Array,
    activeIndex: Number,
  };
}
