<template>
  <v-layout row pt-2>
    <v-flex xs12>
      <v-card>
        <h1>{{ScheduleId}}</h1>
        <v-card-title>
          <template v-if="Lists">
            Callsheet Time :{{ Number(Lists.callsheet)* 60*7}} Min
            <br>
            Total Time : {{Lists.totalTime}} Min
            <br>
            Completed Time : {{Lists.totalCompletedTime}} Min
            <br>
            <template v-if="Lists.totalCompletedTime  >=   (Number(Lists.callsheet)* 60*7) ">
              <v-btn color="danger" @click="AnalysisFn()">Analysis</v-btn>
            </template>
          </template>
          <v-spacer></v-spacer>
          <v-text-field
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
              <td>{{ props.item.Shot }}</td>
              <td>{{ props.item.Subject }}</td>
              <td>{{ props.item.Camera }}</td>
              <td>{{ props.item.Movement }}</td>
              <td>{{ props.item.Equipment }}</td>
              <td>{{ props.item.Lense }}</td>
              <td>{{ props.item.Location }}</td>
              <td>{{ props.item.ShootTime }} Min + {{ props.item.SetupTime }} Min = {{ Number(props.item.ShootTime) + Number(props.item.SetupTime)}} Min</td>
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
                    <template
                      v-else
                    >Start Time {{(Number(Lists.callsheet)* 60*7) }} || {{Lists.totalCompletedTime}}</template>
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
import moment from "moment";

export default {
  data() {
    return {
      search: "",
      headers: [
        { text: "Id", value: "id" },
        // { text: "Day", value: "Day" },
        { text: "Shot", value: "Shot" },
        { text: "Subject", value: "Subject" },
        { text: "Camera", value: "Camera" },
        { text: "Movement", value: "Movement" },
        { text: "Equipment", value: "Equipment" },
        { text: "Lense", value: "Lense" },
        { text: "Location", value: "Location" },
        { text: "ShootTime + SetupTime", value: "ShootTime" },
        // { text: "SetupTime", value: "SetupTime" },
        { text: "Time", value: "time" }
      ],
      userId: "123",
      ScheduleId: "23M4"
    };
  },
  mounted() {
    this.initializeFn();
  },
  computed: {
    Lists() {
      return this.$store.getters.todayDateData;
    },
    isSingleCompleted() {
      return this.$store.getters.isSingleCompleted;
    }
  },
  methods: {
    moment(date) {
      return moment(date);
    },
    initializeFn() {
      var today = new Date();
      var dd = String(today.getDate());
      var mm = String(today.getMonth() + 1);
      // this.ScheduleId = dd + "M" + mm;
      this.ScheduleId = "20M4";
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
      for (let q = 0; q < list.length; q++) {
        if (list[q].startTime == 0) {
          notShooted.push(list[q]);
          PendingSummeryObj.push({
            Id: list[q].Id,
            isDone: list[q].isDone
          });
        }
      }
      this.$store.dispatch("setPendingShoots", {
        userId: this.userId,
        ScheduleId: this.ScheduleId,
        list: notShooted,
        PendingSummeryObj: PendingSummeryObj
      });
    }
  }
};
</script>

<style>
</style>
