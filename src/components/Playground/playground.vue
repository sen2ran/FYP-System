<template>
  <input type="number" @blur="addDecimalFn" v-model="price">
</template>

<script>
export default {
  data() {
    return {
      price: null
    };
  },
  methods: {
    addDecimalFn() {
      this.price = this.price.toFixed(2);
    }
  }
};
</script> 
