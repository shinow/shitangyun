import modules from './modules'
import Vue from 'vue'

import Router from 'uni-simple-router'

import store from '@/store/index'

import Request from '@/utils/request'

Vue.use(Router)

//初始化
const router = new Router({
    routes: ROUTES //路由表
})

//路由守卫白名单
const whiteList = ['/pages/index/index', '/pages/bind/bind']

const httpRequest = new Request()

httpRequest.setConfig((config) => {
    config.baseUrl = ''
    config.header = {
        'content-type': 'application/x-www-form-urlencoded'
    }
    return config
})

//全局路由前置守卫
router.beforeEach((to, from, next) => {
    if (to.path.indexOf('/pages/auth/auth') != -1) {
        next()
    } else {
        const hasAuth = store.state.hasAuth
        if (hasAuth) {
            const wxUserInfo = store.state.wxUserInfo
            httpRequest.post('/wechat/employee/getEmployeeByOpenid.json', {
                openid: wxUserInfo.openid
            }).then((res) => {
                if (res.data.code == 'SUCCESS') {
                    if (res.data.entity) {
                        store.commit('bind', true)
                        store.commit('setEmployee', res.data.entity)
                    } else {
                        store.commit('bind', false)
                        store.commit('setEmployee', {})
                    }
                } else {
                    store.commit('bind', false)
                    store.commit('setEmployee', {})
                }
                if (whiteList.indexOf(to.path) !== -1) {
                    next()
                } else {
                    if (!store.state.hasBind) {
                        next('/pages/bind/bind')
                    } else {
                        next()
                    }
                }
            })
        } else {
            next('/pages/auth/auth')
        }
    }
})

// 全局路由后置守卫
router.afterEach((to, from) => {})

export default router
