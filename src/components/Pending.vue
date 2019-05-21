<template>
  <v-layout row pt-2 pl-2 pr-2>
    <v-flex xs12>
      <v-card>
        <v-card-title>
          <h1>Pending Shots</h1>
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
                  <h3 class="headline mb-0">Selected Shot</h3>
                  <br>
                </v-card-title>
                <div pl-5>
                  <center>
                    <template v-if="label == 0">
                      <h4 style="color : red">{{label}}</h4>
                    </template>
                    <template v-else>
                      <h4 style="color : green">{{label}}</h4>
                    </template>
                  </center>
                  <br>
                  <ul>
                    <!-- <li>
                      <p>Label : {{label}}</p>
                    </li>-->
                    <li>
                      <p class="upperCase">Equipment : {{singlePending.Equipment}}</p>
                    </li>
                    <li>
                      <p class="upperCase">Location : {{singlePending.Location}}</p>
                    </li>
                    <li>
                      <p
                        class="upperCase"
                      >Setup Time + Shot Time : {{Number(singlePending.ShootTime) + Number(singlePending.SetupTime )}} Min</p>
                    </li>
                    <li>
                      <p class="upperCase">Character : {{toStringFn(singlePending.Subject)}}</p>
                    </li>
                  </ul>
                </div>
              </v-card>
            </v-flex>
          </v-layout>
        </template>
        <v-layout row pt-1 pl-1 pr-1 pb-2>
          <v-flex
            xs3
            pt-1
            pl-1
            pr-1
            pb-2
            v-for="(date , index) in upcommingDatesForPending"
            :key="index"
          >
            <v-card>
              <v-card-title>
                <h3 class="headline mb-0">Shoot Id : {{date.id}}</h3>
              </v-card-title>
              <div pl-5>
                <ul>
                  <li>
                    <p class="upperCase">callsheet: {{Number(date.callsheet) * 60 * 7}}</p>
                  </li>
                  <li>
                    <p class="upperCase">date: {{date.date}}</p>
                  </li>
                  <li>
                    <p class="upperCase">Equipment : {{toStringFn(date.equipment)}}</p>
                  </li>
                  <li>
                    <p class="upperCase">Location : {{toStringFn(date.locations)}}</p>
                  </li>
                  <li>
                    <p class="upperCase">Total Time : {{date.totalTime}}</p>
                  </li>
                  <li>
                    <p class="upperCase">Character : {{toStringFn(date.characters)}}</p>
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
import toString from "@/util/ArrayToStringComa.js";
import axios from "axios";
import * as firebase from "firebase";

var baseUrl = "http://127.0.0.1:5000/";

const instance = axios.create({
  baseURL: baseUrl,
  config: { headers: { "Content-Type": "multipart/form-data" } }
});

export default {
  data() {
    return {
      pedingShootingObjIndex: null,
      upcommingDatesForPending: [],
      label: ""
    };
  },
  mounted() {
    this.initializeFn();
  },
  computed: {
    userId() {
      if (localStorage.getItem("userId")) {
        return localStorage.getItem("userId");
      } else {
        return null;
      }
    },
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
        userId: this.userId,
        date: str
      });
    },
    GetDetails(id, shootIndex, index) {
      this.pedingShootingObjIndex = index;
      let tem = id;
      let date = id.split("S")[0];
      let shootIndex2 = shootIndex;
      this.$store.dispatch("loadDataForSinglePending", {
        id: date,
        userId: localStorage.getItem("userId"),
        shootIndex: shootIndex2
      });
      let tmp;
      var loadDataForToday = firebase
        .database()
        .ref("users/"+localStorage.getItem("userId")+"/Pending/" + id.split("S")[0] + "/" + shootIndex);
      loadDataForToday.once("value", snapshot => {
        tmp = snapshot.val();

        let strSubject = tmp.Subject;
        let sub = "";
        for (let index = 0; index < strSubject.length; index++) {
          console.log(strSubject[index]);
          if (index == 0) {
            sub = strSubject[index];
          } else {
            sub = sub + "/" + strSubject[index];
          }
        }

        console.log(sub);

        var bodyFormData = new FormData();
        bodyFormData.set(
          "scriptTime",
          Number(tmp.SetupTime) + Number(tmp.ShootTime)
        );
        bodyFormData.set("subject", sub);
        bodyFormData.set("location", tmp.Location);
        bodyFormData.set("shotSize", tmp.ShotSize);
        bodyFormData.set("movement", tmp.Movement);

        instance
          .post("/predict", bodyFormData)
          .then(response => {
            console.log("Done : " + JSON.stringify(response.data.value));
            if (response.data.value == 1) {
              this.label = "Late";
            } else {
              this.label = "Early";
            }
          })
          .catch(error => {
            this.label = "Error";
            console.log(error);
          });
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
    toStringFn(value) {
      return toString(value);
    },
    assignFn(id2, indexOfSummeryObj) {
      this.$store.dispatch("setPendingShootUpComingDate", {
        id: id2,
        userId: localStorage.getItem("userId"),
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
.upperCase {
  text-transform: uppercase;
}
</style>
