/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'
import router from './router'


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
    loadDataForToday({
      commit
    }, payload) {
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
    makeProject({
      commit
    }, payload) {
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
    setEndTime({
      commit
    }, payload) {
      let SumObj
      let listObj
      let totalCompletedTime
      let SummeryObjIndex
      let duration
      let endTime
      let startTime
      endTime = Number(new Date());
      var loadDataForToday = firebase.database().ref('users/' + payload.userId + "/Scheduler/" + payload.ScheduleId + "/list/" + payload.listIndex);
      loadDataForToday.once('value', function (snapshot) {
        listObj = snapshot.val()
        startTime = listObj.startTime;
        duration = Math.round((endTime - startTime) / 60000)

        var SummeryObj = firebase.database().ref('users/' + payload.userId + "/SummeryObj/");
        SummeryObj.once('value', function (snapshot) {
          SumObj = snapshot.val()
          for (let w = 0; w < SumObj.length; w++) {
            if (SumObj[w].id == payload.ScheduleId) {
              SummeryObjIndex = w
              totalCompletedTime = Number(SumObj[w].totalCompletedTime)
              console.log(SummeryObjIndex);
            }
          }
          //Get Duration
          firebase.database().ref('users/' + payload.userId + "/SummeryObj/" + SummeryObjIndex).update({
            totalCompletedTime: totalCompletedTime + duration
          }, function (error) {
            if (error) {
              console.log("Error !!");
            } else {
              console.log("Successfully !!!");

              firebase.database().ref('users/' + payload.userId + "/Scheduler/" + payload.ScheduleId).update({
                totalCompletedTime: totalCompletedTime + duration
              }, function (error) {
                if (error) {
                  console.log("Error !!");
                } else {
                  console.log("Successfully !!!");

                  // // List
                  firebase.database().ref('users/' + payload.userId + "/Scheduler/" + payload.ScheduleId + "/list/" + payload.listIndex).update({
                    totalCompletedTime: duration,
                    endTime: Number(new Date()),
                    isDone: true
                  }, function (error) {
                    if (error) {
                      console.log("Error !!");
                    } else {
                      console.log("Successfully !!!");
                      commit('SET_IS_SINGLE_COMPLETED', false)
                    }
                  });
                }
              });
            }
          });
        });
      });
    },
    setPendingShoots({
      commit
    }, payload) {
      console.log(payload);
      let listObj;
      let PendingSummeryObj;
      let payloadPendingSummeryObj = payload.PendingSummeryObj
      var database = firebase.database();
      var loadDataForPendingSummeryObj = firebase.database().ref('users/' + payload.userId + "/PendingSummeryObj");
      loadDataForPendingSummeryObj.once('value', function (snapshot) {
        listObj = snapshot.val()
        if (listObj == null) {
          PendingSummeryObj = payloadPendingSummeryObj
        } else {
          PendingSummeryObj = listObj.concat(payloadPendingSummeryObj)
        }
        // console.log(PendingSummeryObj);
        firebase.database().ref('users/' + payload.userId + '/Pending').update({
          [payload.ScheduleId]: payload.list
        }, function (error) {
          if (error) {
            console.log("Error !!");
          } else {
            console.log("Successfully !!!");
            firebase.database().ref('users/' + payload.userId).update({
              PendingSummeryObj: PendingSummeryObj
            }, function (error) {
              if (error) {
                console.log("Error !!");
              } else {
                console.log("Successfully !!!");
                router.push('/pending')
                commit('SET_ISADDED', true)
              }
            });
          }
        });
      });
    },
    loadDataForPending({
      commit
    }, payload) {
      let listObj
      let dateObj = []
      var loadDataForSummeryObj = firebase.database().ref('users/' + payload.userId + "/SummeryObj");
      loadDataForSummeryObj.once('value', function (snapshot) {
        listObj = snapshot.val()
        for (let i = 0; i < listObj.length; i++) {
          if (parseFloat(listObj[i].date) >= payload.date) {
            dateObj.push(listObj[i])
          }
        }
        console.log(dateObj); //getting Future 
      });
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