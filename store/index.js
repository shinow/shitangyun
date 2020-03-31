import Vue from 'vue'
import Vuex from 'vuex'

import db from '@/utils/localstorage'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        hasBind: db.get('hasBind', false),
        wxUserInfo: db.get('wxUserInfo'),
        employee: db.get('employee')
    },
    mutations: {
        bind(state, flag) {
            db.save('hasBind', flag)
            state.hasBind = flag
        },
        setWxUserInfo(state, wxUserInfo) {
            db.save('wxUserInfo', wxUserInfo)
            state.wxUserInfo = wxUserInfo
        },
        setEmployee(state, employee) {
            db.save('employee', employee)
            state.employee = employee
        }
    }
})

export default store
