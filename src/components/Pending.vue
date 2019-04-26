<template>
  <h1>Sen2</h1>
</template>

<script>
export default {
  mounted() {
    this.initializeFn();
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
    }
  }
};
</script>

<style>
</style>
