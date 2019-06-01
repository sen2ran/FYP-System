<template>
  <v-layout row pt-2>
    <v-flex xs12>
      <v-card>
        <h1>{{ScheduleIdDate}}</h1>
        <br>
        <br>
        <center>
          <h1 v-if="!isToday" style="color : red">We Don't Have A Schedule Today !</h1>
        </center>

        <v-card-title>
          <template v-if="Lists">
            Callsheet Time : {{ Number(Lists.callsheet)* 60*7}} Min
            <br>
            Total Time : {{Lists.totalTime}} Min
            <br>
            Completed Time : {{Lists.totalCompletedTime}} Min
            <br>
            <template v-if="Lists.totalCompletedTime  >=   (Number(Lists.callsheet)* 60*7) ">
              <v-btn color="danger" :disabled="Lists.isComplelte" @click="AnalysisFn()">Analysis</v-btn>
            </template>
          </template>
          <v-spacer></v-spacer>
          <v-text-field
            v-if="Lists"
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <!-- {{Lists}} -->
        <template v-if="Lists">
          <v-data-table :headers="headers" :items="Lists.list" :search="search">
            <template v-slot:items="props">
              <td>{{ props.item.Id }}</td>
              <!-- <td>{{ moment(props.item.TimeStamp).format("MMM Do YY")}}</td> -->
              <td class="upperCase">{{ props.item.Setup }}</td>
              <td class="upperCase">{{ props.item.Shot }}</td>
              <td class="upperCase">{{ toStringFn(props.item.Subject) }}</td>
              <td class="upperCase">{{ props.item.Camera }}</td>
              <td class="upperCase">{{ props.item.Equipment }}</td>
              <td class="upperCase">{{ props.item.Lense }}</td>
              <td class="upperCase">{{ props.item.Location }}</td>
              <td
                class="upperCase"
              >{{ props.item.ShootTime }} Min + {{ props.item.SetupTime }} Min = {{ Number(props.item.ShootTime) + Number(props.item.SetupTime)}} Min</td>
              <!-- <td>{{ props.item.SetupTime }}</td> -->
              <!-- <template v-if="Lists.totalCompletedTime   >  (Number(Lists.callsheet)* 60*7) ">
                <td>Pending</td>
              </template>-->
              <template v-if="props.item.startTime  ==  0 && props.item.endTime  ==  0 ">
                <td>
                  <v-btn
                    color="success"
                    :disabled="isSingleCompleted || Lists.totalCompletedTime   >=  (Number(Lists.callsheet)* 60*7)"
                    @click="startTimeFn(props)"
                  >
                    <template
                      v-if=" Lists.totalCompletedTime   >=  (Number(Lists.callsheet)* 60*7)"
                    >Pending</template>
                    <template v-else>Start Time</template>
                  </v-btn>
                </td>
              </template>
              <template v-else-if="props.item.startTime  >  0 && props.item.endTime  ==  0 ">
                <td>
                  <v-btn color="success" @click="endTimeFn(props)">End Tme</v-btn>
                </td>
              </template>
              <template v-else-if="props.item.startTime  >  0 && props.item.endTime >   0 ">
                <td>{{props.item.totalCompletedTime}} Min</td>
              </template>
            </template>
            <v-alert
              v-slot:no-results
              :value="true"
              color="error"
              icon="warning"
            >Your search for "{{ search }}" found no results.</v-alert>
          </v-data-table>
        </template>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
/* eslint-disable */

import toString from "@/util/ArrayToStringComa.js";
import CSVfileMaker from "@/util/CSVfileMaker.js";

import moment from "moment";

export default {
  data() {
    return {
      search: "",
      headers: [
        { text: "Id", value: "id" },
        // { text: "Day", value: "Day" },
        { text: "Setup", value: "Setup" },
        { text: "Shot", value: "Shot" },
        { text: "Subject", value: "Subject" },
        { text: "Camera", value: "Camera" },
        { text: "Equipment", value: "Equipment" },
        { text: "Lense", value: "Lense" },
        { text: "Location", value: "Location" },
        { text: "ShootTime + SetupTime", value: "ShootTime" },
        // { text: "SetupTime", value: "SetupTime" },
        { text: "Time", value: "time" }
      ],
      // : "123",
      ScheduleId: "25M4"
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
    Lists() {
      return this.$store.getters.todayDateData;
    },
    isToday() {
      return this.$store.getters.isToday;
    },
    isSingleCompleted() {
      return this.$store.getters.isSingleCompleted;
    },
    ScheduleIdDate() {
      let day = this.ScheduleId.split("M")[0];
      let month = this.ScheduleId.split("M")[1];
      return new Date(month + "/" + day + "/" + 2019);
    }
  },
  methods: {
    moment(date) {
      return moment(date);
    },
    toStringFn(value) {
      return toString(value);
    },
    initializeFn() {
      var today = new Date();
      var dd = String(today.getDate());
      var mm = String(today.getMonth() + 1);
      // this.ScheduleId = dd + "M" + mm;
      this.ScheduleId = "23M4";
      this.$store.dispatch("loadDataForToday", {
        userId: this.userId,
        ScheduleId: this.ScheduleId
      });
    },
    startTimeFn(obj) {
      this.$store.dispatch("setStartTime", {
        userId: this.userId,
        ScheduleId: this.ScheduleId,
        listIndex: obj.index
      });
    },
    endTimeFn(obj) {
      this.$store.dispatch("setEndTime", {
        userId: this.userId,
        ScheduleId: this.ScheduleId,
        listIndex: obj.index
      });
    },
    AnalysisFn() {
      let notShooted = [];
      let list = this.Lists.list;
      let PendingSummeryObj = [];
      let CSVJson = [];
      let shootIndex = 0;
      // console.log(list);

      for (let q = 0; q < list.length; q++) {
        if (list[q].startTime == 0) {
          notShooted.push(list[q]);
          PendingSummeryObj.push({
            Id: list[q].Id,
            isDone: false,
            shootIndex: shootIndex
          });
          shootIndex++;
        } else {
          let label;

          // //Binary  Start
          // label =
          //   parseFloat(list[q].SetupTime) + parseFloat(list[q].ShootTime) >
          //   list[q].totalCompletedTime
          //     ? 0
          //     : 1;
          // //Binary  End

          //Tenary Start
          let estimatedTime =
            parseFloat(list[q].SetupTime) + parseFloat(list[q].ShootTime);

          let earlyTime = estimatedTime - estimatedTime / 5;
          let lateTime = estimatedTime + estimatedTime / 5;

          let completedTime = list[q].totalCompletedTime;

          if (earlyTime > completedTime) {
            label = 0;
          } else if (earlyTime < completedTime < lateTime) {
            label = 1;
          } else if (lateTime < completedTime) {
            label = 2;
          }

          //Tenary End

          let Id = list[q].Id;
          let tmpId = Id.split("M");

          let tmpMonth = tmpId[1].split("S")[0];
          let tmpDate = tmpId[0];

          let date = tmpDate + "." + tmpMonth;
          let Subject = list[q].Subject;
          let sub = "";
          for (let index = 0; index < Subject.length; index++) {
            // console.log(Subject[index]);
            if (index == 0) {
              sub = Subject[index];
            } else {
              sub = sub + "/" + Subject[index];
            }
          }
          CSVJson.push({
            Day: date,
            Setup: list[q].Setup,
            Shot: list[q].Shot,
            Subject: sub,
            ShotSize: list[q].ShotSize,
            Camera: list[q].Camera,
            Movement: list[q].Movement,
            Equipment: list[q].Equipment,
            Lense: list[q].Lense,
            ScriptTime: list[q].ScriptTime,
            SetupTime: list[q].SetupTime,
            ShootTime: list[q].ShootTime,
            Location: list[q].Location,
            CallSheet: list[q].CallSheet,
            Label: label
          });
        }
      }
      this.$store.dispatch("setPendingShoots", {
        userId: this.userId,
        ScheduleId: this.ScheduleId,
        list: notShooted,
        PendingSummeryObj: PendingSummeryObj,
        complete: CSVJson
      });
    }
  }
};
</script>

<style>
</style>


<style>
.upperCase {
  text-transform: uppercase;
}
</style>
