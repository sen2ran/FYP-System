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
    todayDateData: null,
    pendingObjs: null,
    upcommingDates: null,
    singlePending: null,
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
    SET_PENDING_UPCOMMING_DATE(state, payload) {
      state.pendingObjs = payload.pendingObjs
      state.upcommingDates = payload.upcommingDates
    },
    SET_SINGLE_PENDING(state, payload) {
      state.singlePending = payload.singlePendingShoot
    },
    // SET_RESET(state, payload) {
    //   state.singlePending = null;
    // }
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
    setPendingShootUpComingDate({
      commit
    }, payload) {
      commit('SET_SINGLE_PENDING', {
        singlePendingShoot: null,
      })
      let totalTime;
      let listLength;
      console.log(payload);
      var loadDataFormId = firebase.database().ref('users/' + payload.userId + '/Scheduler/' + payload.id);
      loadDataFormId.once('value', function (snapshot) {
        console.log(snapshot.val());
        totalTime = payload.totalTime + snapshot.val().totalTime
        listLength = snapshot.val().list.length
        firebase.database().ref('users/' + payload.userId + '/Scheduler/' + payload.id).update({
          totalTime: totalTime
        }, function (error) {
          if (error) {
            console.log("Error !!");
          } else {
            console.log("Successfully !!!");
            firebase.database().ref('users/' + payload.userId + '/Scheduler/' + payload.id + "/list").update({
              [listLength]: payload.list
            }, function (error) {
              if (error) {
                console.log("Error !!");
              } else {
                console.log("Successfully !!!");
                firebase.database().ref('users/' + payload.userId + '/SummeryObj/' + payload.indexOfSummeryObj).update({
                  totalTime: totalTime
                }, function (error) {
                  if (error) {
                    console.log("Error !!");
                  } else {
                    console.log("Successfully !!!");
                    firebase.database().ref('users/' + payload.userId + '/PendingSummeryObj/' + payload.pedingShootingObjIndex).update({
                      isDone: true
                    }, function (error) {
                      if (error) {
                        console.log("Error !!");
                      } else {
                        console.log("Successfully !!!");
                        // commit('SET_RESET')
                      }
                    });
                  }
                });
              }
            });
          }
        });
      })
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
    loadDataForSinglePending({
      commit
    }, payload) {
      let temObj
      var loadDataForSinglePendingObj = firebase.database().ref('users/' + payload.userId + "/Pending/" + payload.id + "/" + payload.shootIndex);
      loadDataForSinglePendingObj.once('value', function (snapshot) {
        temObj = snapshot.val()
        commit('SET_SINGLE_PENDING', {
          singlePendingShoot: temObj,
        })
      })
    },
    loadDataForPending({
      commit
    }, payload) {
      let listObj
      let pendingObj
      let dateObj = []
      var loadDataForSummeryObj = firebase.database().ref('users/' + payload.userId + "/SummeryObj");
      loadDataForSummeryObj.on('value', function (snapshot) {
        listObj = snapshot.val()
        for (let i = 0; i < listObj.length; i++) {
          if (parseFloat(listObj[i].date) >= payload.date) {
            dateObj.push({
              indexOfSummeryObj: i,
              ...listObj[i]
            })
          }
        }
        console.log(dateObj); //getting Future 
        var loadDataForPedingObj = firebase.database().ref('users/' + payload.userId + "/PendingSummeryObj");
        loadDataForPedingObj.once('value', function (snapshot) {
          pendingObj = snapshot.val()
          let tempPending = []
          for (let e = 0; e < pendingObj.length; e++) {
            if (!pendingObj[e].isDone) {
              tempPending.push(pendingObj[e])
            }
          }
          pendingObj = tempPending
          commit('SET_PENDING_UPCOMMING_DATE', {
            pendingObjs: pendingObj,
            upcommingDates: dateObj
          })
        })
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
    },
    pendingObjs(state) {
      return state.pendingObjs
    },
    upcommingDates(state) {
      return state.upcommingDates
    },
    singlePending(state) {
      return state.singlePending
    }
  }
})