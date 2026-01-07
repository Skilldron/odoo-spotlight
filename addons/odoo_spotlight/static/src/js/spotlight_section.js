import { Component } from "@odoo/owl";

export class SpotlightSection extends Component {
  static template = "odoo_spotlight.SpotlightSection";
  static props = {
    title: String,
    icon: String,
    items: Array,
    activeIndex: Number,
  };
}
