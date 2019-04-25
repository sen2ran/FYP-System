<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card>
          <v-card-title>
            <v-container>
              <form @submit.prevent="onSubmit">
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      name="name"
                      label="Project Title"
                      id="Project title"
                      v-model="name"
                      type="text"
                    ></v-text-field>
                  </v-flex>
                </v-layout>

                <v-layout>
                  <v-flex xs12>
                    Select a file:
                    <input
                      type="file"
                      v-on:change="csvUploadFn($event.target.files)"
                      name="myFile"
                      id="csvUpload"
                    >
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-btn type="submit">Submit</v-btn>
                  </v-flex>
                </v-layout>
              </form>
            </v-container>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import moment from "moment";
export default {
  data() {
    return {
      name: null,
      mainObj: [],
      obj: [],
      totalTime: "",
      dates: [],
      search: "",
      scheduler: null,
      dateObj: null,
      headers: [
        { text: "Day", value: "Day" },
        // { text: "Setup", value: "Setup" },
        { text: "Shot", value: "Shot" },
        { text: "Subject", value: "Subject" },
        // { text: "ShotSize", value: "ShotSize" },
        { text: "Camera", value: "Camera" },
        // { text: "Angle", value: "Angle" },
        { text: "Movement", value: "Movement" },
        { text: "Equipment", value: "Equipment" },
        { text: "Lense", value: "Lense" },
        { text: "Location", value: "Location" },
        // { text: "ScriptTime", value: "ScriptTime" },
        { text: "ShootTime", value: "ShootTime" },
        { text: "SetupTime", value: "SetupTime" }
        // { text: "CallSheets", value: "CallSheet" }
      ]
    };
  },
  computed: {
    isAdded() {
      return this.$store.getters.isAdded;
    }
  },
  watch: {
    isAdded(value) {
      if (value == true) {
        this.$router.push("/today");
      }
    }
  },
  methods: {
    onSubmit() {
      document.getElementById("csvUpload").value = "";
      if (this.name && this.scheduler) {
        this.$store.dispatch("makeProject", {
          Name: this.name,
          Scheduler: this.scheduler,
          SummeryObj: this.dateObj
        });
      }
    },
    moment(date) {
      return moment(date);
    },
    csvUploadFn(value) {
      var files = value;
      let file = files[0];
      var reader = new FileReader();
      reader.onload = e => {
        var texto = e.target.result;
        this.mainObj = this.JSONfomat(this.csvJSON(texto));
      };
      reader.readAsText(file);
    },
    csvJSON(csv) {
      var lines = csv.split("\n");
      var result = [];
      var headers;
      for (var i = 0; i < lines.length - (lines.length - 1); i++) {
        headers = lines[i].split("\n");
        headers = headers[0].split(",");
      }
      var cont = 0;
      for (var i = 1; i < lines.length - 1; i++) {
        var obj = {};
        var currentline = lines[i].split("\n");
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[0].split(",")[j];
        }
        cont++;
        result.push(obj);
      }
      return result; //JSON
    },
    JSONfomat(obj) {
      let arr = [];
      let dates = [];
      let dateObj = [];
      let totalTime = 0;
      for (let i = 0; i < obj.length; i++) {
        let objx = {};
        let day = obj[i].Day.split(".")[0];
        let month = obj[i].Day.split(".")[1];
        let chars = "";
        let sub = obj[i].Subject.split("/");
        objx.date = day;
        objx.TimeStamp = Number(new Date(month + "/" + day + "/" + 2019));
        objx.Day = new Date(month + "/" + day + "/" + 2019);
        objx.Setup = obj[i].Setup;
        objx.Shot = obj[i].Shot;
        objx.Subject = sub;
        objx.ShotSize = obj[i].ShotSize;
        objx.Camera = obj[i].Camera;
        objx.Angle = obj[i].Angle;
        objx.Movement = obj[i].Movement;
        objx.Equipment = obj[i].Equipment;
        objx.Lense = obj[i].Lense;
        objx.ScriptTime = obj[i].ScriptTime;
        objx.Location = obj[i].Location;
        objx.ShotSize = obj[i].ShotSize;
        objx.ShootTime = obj[i].ShootTime;
        objx.SetupTime = obj[i].SetupTime;
        objx.isDone = false;
        objx.startTime = 0;
        objx.endTime = 0;
        objx.totalCompletedTime = 0;
        totalTime =
          totalTime + Number(obj[i].ShootTime) + Number(obj[i].SetupTime);
        objx.CallSheet = obj[i].CallSheet;
        arr.push(objx);

        if (!dates.includes(day)) {
          dates.push(day);
          dateObj.push({
            date: obj[i].Day,
            id: day + "M" + month
          });
        }
      }
      this.dates = dates; //
      this.totalTime = totalTime / 4;

      let scheduler = {};
      let arrays = arr;
      // scheduler.dates = dateObj;
      for (let v = 0; v < dateObj.length; v++) {
        scheduler[dateObj[v].id] = this.dateFn(dates[v], arrays, dateObj[v].id);
        dateObj[v].totalTime = scheduler[dateObj[v].id].totalTime;
        dateObj[v].totalCompletedTime = 0;
        dateObj[v].callsheet = scheduler[dateObj[v].id].callsheet;
      }
      console.log(scheduler);
      this.scheduler = scheduler;
      this.dateObj = dateObj;
      return arr;
    },
    dateFn(date, arrays, id) {
      let finalObj = {};
      let arr = [];
      let characters = [];
      let camArray = [];
      let location = [];
      let equipment = [];
      let callsheet = 0;
      let totalTime = 0;

      let listIndex = 0;
      for (let a = 0; a < arrays.length; a++) {
        let data = arrays[a];
        if (date == arrays[a].date) {
          arrays[a].Id = id + "S" + (listIndex + 1);
          arr.push(arrays[a]);
          listIndex++;
          for (let w = 0; w < arrays[a].Subject.length; w++) {
            let char = arrays[a].Subject[w];
            if (!characters.includes(char)) {
              characters.push(char);
            }
          }
          if (!camArray.includes(arrays[a].Camera.trim().toLowerCase())) {
            camArray.push(arrays[a].Camera.trim().toLowerCase());
          }
          if (!location.includes(arrays[a].Location.trim().toLowerCase())) {
            location.push(arrays[a].Location.trim().toLowerCase());
          }

          if (!equipment.includes(arrays[a].Equipment.trim().toLowerCase())) {
            equipment.push(arrays[a].Equipment.trim().toLowerCase());
          }

          callsheet = arrays[a].CallSheet;
          totalTime =
            totalTime + Number(data.ShootTime) + Number(data.SetupTime);
        }
      }
      return (finalObj = {
        list: arr,
        characters: characters,
        camera: camArray,
        locations: location,
        equipment: equipment,
        totalTime: totalTime,
        callsheet: callsheet,
        totalCompletedTime: 0
      });
      // this.obj = arr;
    }
  }
};
</script>