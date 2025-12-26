Vue.component("record-row", {
  props: ["wr", "pb", "label"],

  data() {
    return {
      maxName: 7,
      loadingImage: "assets/loading.gif",
    };
  },

  methods: {
    formatTime: function (seconds) {
      seconds = parseFloat(seconds).toFixed(2);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor((seconds % 3600) % 60);
      const ms = seconds.slice(-3);

      const pad = (num) => ("000" + num).slice(-2);
      const result = `${pad(m)}:${pad(s)}.${pad(ms)}`;

      if (h > 0) {
        return `${pad(h)}:${result}`;
      }

      return result;
    },
  },

  template: `
    <tr class="record-row">
      <td>
        <span :class="label.toLowerCase() + '-record-header'">{{label}} |</span>

        <img
          v-if="wr === undefined"
          class="loading-indicator"
          :src="loadingImage"
        />

        <div v-else style="display: inline">
          <span>{{formatTime(wr.time)}} by</span>
          <span class="record-player-name">{{wr.player_name}}</span>

          <img
            v-if="pb === undefined"
            class="loading-indicator"
            :src="loadingImage"
          />

          <div v-else-if="pb" style="display: inline">
            <span v-if="pb.time === wr.time" class="record-time-wr"
              >(WR by me)
            </span>
            <span v-else class="record-time-diff"
              >(+{{formatTime(pb.time - wr.time)}})
            </span>
          </div>
        </div>
      </td>
    </tr>
  `,
});
