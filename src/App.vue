<template>
  <v-app>
    <v-navigation-drawer temporary fixed v-model="sideNav">
      <v-list>
        <v-list-tile v-for="item in menuItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{item.title}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar dark class="primary">
      <v-toolbar-side-icon @click.stop="sideNav = !sideNav"></v-toolbar-side-icon>
      <v-toolbar-title>
        <router-link to="/" style="cursor: pointer" tag="span">PlanFilmy</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in menuItems" :key="item.title" :to="item.link">
          <v-icon left>{{item.icon}}</v-icon>
          {{item.title}}
        </v-btn>
        <v-btn flat v-if="userIsAuthenticated" @click="LogoutFn()">
          <v-icon left>face</v-icon>Logout
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <router-view></router-view>
    </main>
  </v-app>
</template>

<script>


export default {
  data() {
    return {
      sideNav: false
    };
  },
  computed: {
    menuItems() {
      let menuItems;
      if (this.userIsAuthenticated) {
        menuItems = [
          { icon: "person", title: "ADD", link: "/add" },
          { icon: "person", title: "Today", link: "/today" },
          { icon: "person", title: "Pending", link: "/pending" }
        ];
      } else {
        menuItems = [
          { icon: "face", title: "Sign up", link: "/signup" },
          { icon: "lock_open", title: "Sign in", link: "/signin" }
        ];
      }
      return menuItems;
    },
    userIsAuthenticated() {
      if (
        this.$store.getters.user !== null &&
        this.$store.getters.user !== undefined
      ) {
        return true;
      } else {
        // console.log(this.$store.getters.user);
        return false;
      }
    }
  },
  methods: {
    LogoutFn() {
      localStorage.clear();
      this.$router.push("/signin");
      this.$store.dispatch("logoutFn"); 
    }
  }
};
</script>
<style>
</style>