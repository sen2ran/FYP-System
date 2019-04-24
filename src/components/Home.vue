<template>
  <v-container>
    <v-layout row wrap class="mt-2">
      <v-flex xs12>
  
      </v-flex>
    </v-layout>
    <v-layout row wrap class="mt-2">
      <v-flex xs12 class="text-xs-center">
        Hey ! Welcome to the Film Shoot Scheduler :) 
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed : {
    items(){
      return this.$store.getters.featuredMeetups 
    }
  },
  // data() {
  //   return {
  //     items: [
  //       {
  //         id: "1",
  //         title: "Vannakam 1",
  //         src: "https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg"
  //       },
  //       {
  //         id: "2",
  //         title: "Vannakam 2",
  //         src: "https://cdn.vuetifyjs.com/images/carousel/sky.jpg"
  //       }
  //     ]
  //   };
  // },
  methods: {
    onLoadMeetup(id) {
      this.$router.push("/meetups/" + id);
    }
  }
};
</script>

<style scoped>
.title {
  position: absolute;
  bottom: 50px;
  padding-left: 50%;

  /* text-align: center; */
  /* background-color: rgba(0, 0, 0, 0.5); */
  color: white;
  font-size: 2em;
}
</style>
