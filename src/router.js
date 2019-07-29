import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Today from '@/components/Today'
import Pending from '@/components/Pending'
import Signin from '@/components/User/Signin'
import Signup from '@/components/User/Signup'
import Playground from '@/components/Playground'
import Add from '@/components/Add'


Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/add',
      name: 'Add',
      component: Add
    },
    {
      path: '/today',
      name: 'today',
      component: Today
    },
    {
      path: '/pending',
      name: 'pending',
      component: Pending
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin
    },
    {
      path: '/playground',
      name: 'Playground',
      component: Playground
    }
  ],
  mode: 'history'
})