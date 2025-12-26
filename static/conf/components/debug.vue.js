Vue.component("debug-table", {
  emits: ["changeMap", "changeMode"],

  props: {
    map: String,
    modes: Array,
  },

  watch: {
    map: function (newVal) {
      this.mapName = newVal;
    },
  },

  data() {
    return {
      mapName: this.map,
    };
  },

  template: `
    <table style="margin-top: 20px">
      <tr style="display: block">
        <td>
          <span style="padding-left: 0">Map:</span>
          <input v-model="mapName" @change="$emit('changeMap', mapName)">
        </td>
      </tr>
      <tr style="display: block; margin-top: 5px">
        <button v-for="mode in modes" :key="mode" @click="$emit('changeMode', mode)">
          {{mode}}
        </button>
      </tr>
    </table>
  `,
});
