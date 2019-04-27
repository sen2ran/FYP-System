<template>
  <!-- <div>
  <h1>Sen2</h1>
  <p>
    {{pendingObjs}}
  </p>
  </div>-->
  <v-layout row pt-2 pl-2 pr-2>
    <v-flex xs12>
      <v-card>
        <v-card-title>
          Hey !!!
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-title>
          <template v-for="(shootNum , index) in  pendingObjs">
            <v-btn
              color="danger"
              :key="index"
              @click="GetDetails(shootNum.Id , shootNum.shootIndex, index)"
            >{{shootNum.Id}}</v-btn>
          </template>
        </v-card-title>
        <template v-if="singlePending">
          <v-layout row pt-1 pl-1 pr-1 pb-2>
            <v-flex xs12>
              <v-card>
                <v-card-title>
                  <h3 class="headline mb-0">Seletcted Shoot</h3>
                </v-card-title>
                <div pl-5>
                  <ul>
                    <li>
                      <p>Equipment : {{singlePending.Equipment}}</p>
                    </li>
                    <li>
                      <p>Location : {{singlePending.Location}}</p>
                    </li>
                    <li>
                      <p>Setup Time + Shoot Time : {{Number(singlePending.ShootTime) + Number(singlePending.SetupTime )}} Min</p>
                    </li>
                    <li>
                      <p>Character : {{singlePending.Subject}}</p>
                    </li>
                  </ul>
                </div>
              </v-card>
            </v-flex>
          </v-layout>
        </template>
        <v-layout row pt-1 pl-1 pr-1 pb-2>
          <v-flex xs3 pt-1 pl-1 pr-1 pb-2 v-for="(date , index) in upcommingDatesForPending" :key="index">
            <v-card>
              <v-card-title>
                <h3 class="headline mb-0">Shoot Id : {{date.id}}</h3>
              </v-card-title>
              <div pl-5>
                <ul>
                  <li>
                    <p>callsheet: {{Number(date.callsheet) * 60 * 7}}</p>
                  </li>
                  <li>
                    <p>date: {{date.date}}</p>
                  </li>
                  <li>
                    <p>Equipment : {{date.equipment}}</p>
                  </li>
                  <li>
                    <p>Location : {{date.locations}}</p>
                  </li>
                  <li>
                    <p>Total Time : {{date.totalTime}}</p>
                  </li>
                  <li>
                    <p>Character : {{date.characters}}</p>
                  </li>
                </ul>
              </div>
              <v-card-actions>
                <v-btn color="success" @click="assignFn(date.id ,date.indexOfSummeryObj)">Assign</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      pedingShootingObjIndex: null,
      upcommingDatesForPending: []
    };
  },
  mounted() {
    this.initializeFn();
  },
  computed: {
    pendingObjs() {
      return this.$store.getters.pendingObjs;
    },
    upcommingDates() {
      return this.$store.getters.upcommingDates;
    },
    singlePending() {
      return this.$store.getters.singlePending;
    }
  },
  watch: {
    singlePending(value) {
      if (value != null) {
        this.AssignFilterFn(value);
      }
    },
    upcommingDates(value) {}
  },
  methods: {
    initializeFn() {
      var today = new Date();
      var dd = String(today.getDate());
      var mm = String(today.getMonth() + 1);
      var str = parseFloat(dd + "." + mm);
      this.$store.dispatch("loadDataForPending", {
        userId: "123",
        date: str
      });
    },
    GetDetails(id, shootIndex, index) {
      console.log(id);
      this.pedingShootingObjIndex = index;
      let tem = id;
      let date = id.split("S")[0];
      let shootIndex2 = shootIndex;
      this.$store.dispatch("loadDataForSinglePending", {
        id: date,
        userId: "123",
        shootIndex: shootIndex2
      });
    },
    AssignFilterFn(value) {
      let tmp = value;
      // let callsheet =  Number(date.callsheet) * 60 * 7
      let totalTime = Number(tmp.ShootTime) + Number(tmp.SetupTime);
      let chars = tmp.Subject;
      let location = tmp.Location;
      let camera = tmp.Camera;
      let equipment = tmp.Equipment;
      let upcommingDates = JSON.parse(JSON.stringify(this.upcommingDates));
      let upcommingDatesForPending = [];

      for (let i = 0; i < upcommingDates.length; i++) {
        let single = upcommingDates[i];
        // 1st callsheet
        if (
          Number(single.totalTime) + totalTime <=
          Number(single.callsheet) * 60 * 7
        ) {
          //2nd location
          if (single.locations.includes(location)) {
            //3rd characters
            let isThere = true;
            for (let j = 0; j < chars.length; j++) {
              if (!single.characters.includes(chars[j])) {
                isThere = false;
              }
            }
            if (isThere) {
              //Equipment ,camera still remaing
              upcommingDatesForPending.push(single);
            }
          }
        }
      }
      this.upcommingDatesForPending = upcommingDatesForPending;
    },
    assignFn(id2, indexOfSummeryObj) {
      this.$store.dispatch("setPendingShootUpComingDate", {
        id: id2,
        userId: "123",
        pedingShootingObjIndex: this.pedingShootingObjIndex,
        list: this.singlePending,
        indexOfSummeryObj: indexOfSummeryObj,
        totalTime:
          Number(this.singlePending.ShootTime) +
          Number(this.singlePending.SetupTime)
      });
      this.upcommingDatesForPending = [];
    }
  }
};
</script>

<style>
</style>
