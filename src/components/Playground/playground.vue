

<template>
  <header id="page-header">
    <a id="hamburger" href="#sidebar-nav" target="_self">
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    </a>
    <div class="notification_bell">
      <a href="#">
        <i class="material-icons md-36">notifications</i>
      </a>
    </div>
  </header>
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
