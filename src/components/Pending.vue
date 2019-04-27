<template>
  <h1>Sen2</h1>
</template>

<script>
export default {
  mounted() {
    this.initializeFn();
    console.log("Sen2");
    
  },
  methods: {
    initializeFn() {
      var today = new Date();
      var dd = String(today.getDate());
      var mm = String(today.getMonth() + 1);
      var str = parseFloat(dd + "." + mm);

      //Getting Future  Date Obj
      this.$store.dispatch("loadDataForPending", {
        userId: "123",
        date: str
      });
      // 
    }
  }
};
</script>

<style>
</style>
