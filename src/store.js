import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'
import { stat } from 'fs';
import { duration } from 'moment';
import { async } from 'q';

Vue.use(Vuex)



export default new Vuex.Store({
  state: {
    user: null,
    isAdded: false,
    isSingleCompleted: false,
    todayDateData: null
  },
  mutations: {
    createMeetup(state, payload) {
      state.loadedMeetups.push(payload)
    },
    setUser(state, payload) {
      state.user = payload
    },
    SET_ISADDED(state) {
      state.isAdded = true
    },
    SET_LOAD_DATA_FOR_TODAY(state, payload) {
      state.todayDateData = payload
    },
    SET_IS_SINGLE_COMPLETED(state, payload) {
      state.isSingleCompleted = payload
    },
  },
  actions: {
    loadDataForToday({ commit }, payload) {
      console.log(payload);
      var database = firebase.database();
      var loadDataForToday = firebase.database().ref('users/' + payload.userId + '/Scheduler/' + payload.ScheduleId);
      loadDataForToday.on('value', function (snapshot) {
        commit('SET_LOAD_DATA_FOR_TODAY', snapshot.val())
        var tmp = snapshot.val().list
        console.log(tmp);

        for (let q = 0; q < tmp.length; q++) {
          if (tmp[q].startTime > 0 && tmp[q].endTime == 0) {
            commit('SET_IS_SINGLE_COMPLETED', true)
          }
        }
      });
    },
    makeProject({ commit }, payload) {
      var database = firebase.database();
      firebase.database().ref('users/123').set({
        Name: payload.Name,
        Scheduler: payload.Scheduler,
        SummeryObj: payload.SummeryObj,
      }, function (error) {
        if (error) {
          console.log("Error !!");
        } else {
          console.log("Successfully !!!");
          commit('SET_ISADDED', true)
        }
      });
    },
    setStartTime({
      commit
    }, payload) {
      firebase.database().ref('users/' + payload.userId + "/Scheduler/" + payload.ScheduleId + "/list/" + payload.listIndex).update({
        startTime: Number(new Date()),
      }, function (error) {
        if (error) {
          console.log("Error !!");
        } else {
          console.log("Successfully !!!");
          commit('SET_IS_SINGLE_COMPLETED', true)
        }
      });
    },
    async setEndTime ({
      commit
    }, payload) {
      let SumObj
      let listObj
      let totalCompletedTime
      let SummeryObjIndex
      let startTime


      var loadDataForToday = await firebase.database().ref('users/' + payload.userId + "/Scheduler/" + payload.ScheduleId + "/list/" + payload.listIndex);
      loadDataForToday.once('value', function (snapshot) {
        listObj = snapshot.val()
        startTime = listObj.startTime;
      });

      var SummeryObj = firebase.database().ref('users/' + payload.userId + "/SummeryObj/");
      SummeryObj.once('value', function (snapshot) {
        SumObj = snapshot.val()
        // console.log(SumObj);
        for (let w = 0; w < SumObj.length; w++) {
          if (SumObj[w].id == payload.ScheduleId) {
            SummeryObjIndex = w
            totalCompletedTime = SumObj[w].id
            console.log(totalCompletedTime);
          }
        }
      });

      //Get Duration

      let endTime = Number(new Date());
      let duration = Math.round((endTime - startTime) / 60000)

      console.log(duration);
      console.log(totalCompletedTime);


      //update Mulity Time
      //total time
      // firebase.database().ref('users/' + payload.userId + "/SummeryObj/" + SummeryObjIndex).update({
      //   totalCompletedTime: totalCompletedTime + duration
      // }, function (error) {
      //   if (error) {
      //     console.log("Error !!");
      //   } else {
      //     console.log("Successfully !!!");
      //   }
      // });

      // firebase.database().ref('users/' + payload.userId + "/Scheduler/" + payload.ScheduleId).update({
      //   totalCompletedTime: totalCompletedTime + duration
      // }, function (error) {
      //   if (error) {
      //     console.log("Error !!");
      //   } else {
      //     console.log("Successfully !!!");
      //   }
      // });
      // // List
      // firebase.database().ref('users/' + payload.userId + "/Scheduler/" + payload.ScheduleId + "/list/" + payload.listIndex).update({
      //   totalCompletedTime: duration,
      //   endTime: Number(new Date()),
      //   isDone: true
      // }, function (error) {
      //   if (error) {
      //     console.log("Error !!");
      //   } else {
      //     console.log("Successfully !!!");
      //   }
      // });
      // commit('SET_IS_SINGLE_COMPLETED', false)
    },
    signUserup({
      commit
    }, payload) {
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            const newUser = {
              id: user.user.uid,
              registeredMeetups: [],
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            console.log(error);
          }
        )
    },
    signUserin({
      commit
    }, payload) {
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            // console.log(user.user.uid);
            const newUser = {
              id: user.user.uid,
              registeredMeetups: [],
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            console.log(error);
          }
        )
    }
  },
  getters: {
    // loadedMeetups(state) {
    //   return state.loadedMeetups.sort((meetupA, meetupB) => {
    //     return meetupA.date > meetupB.date
    //   })
    // },
    // featuredMeetups(state, getters) {
    //   return getters.loadedMeetups.slice(0, 5)
    // },
    // loadedMeetup(state) {
    //   return (meetupId) => {
    //     return state.loadedMeetups.find((meetup) => {
    //       return meetup.id == meetupId
    //     })
    //   }
    // },
    isAdded(state) {
      return state.isAdded
    },
    user(state) {
      return state.user
    },
    todayDateData(state) {
      return state.todayDateData
    },
    isSingleCompleted(state) {
      return state.isSingleCompleted
    }
  }
})