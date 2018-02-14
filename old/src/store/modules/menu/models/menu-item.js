import Model from 'vuex-orm/lib/Model';

export default class menuItem extends Model {
  // This is the name used as module name of the Vuex Store.
  static entity = 'menu2'

  // List of all fields (schema) of the menu model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.attr(null),
      order: this.attr(99),
      name: this.attr(''),
      type: this.attt(null),
      icon: this.attr(''),
      slug: this.attr(''),
    };
  }
}
